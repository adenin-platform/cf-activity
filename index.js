'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const decache = require('decache');
const tunnel = require('tunnel');

const {promisify} = require('util');

const exists = promisify(fs.exists);
const readFile = promisify(fs.readFile);

const dateRange = require('./dateRange');
const handleError = require('./handleError');
const isResponseOk = require('./isResponseOk');
const pagination = require('./pagination');
const getObjPath = require('./getObjPath');

const isAscii = /^[ -~]+$/;

module.exports = {
  // legacy
  handleError: handleError,
  isResponseOk: isResponseOk,
  dateRange: dateRange,
  pagination: pagination,
  // end legacy
  initialize: async (_activity) => {
    const lang = (_activity.Context.UserLocale || 'en-US').split('-');
    const fname = _activity.Context.ScriptFolder + path.sep + 'lang' + path.sep + lang[0] + '.json';

    _activity.Context.Translations = null;

    if (await exists(fname)) {
      if (process.env.NODE_ENV === 'development') decache(fname);

      _activity.Context.Translations = require(fname);
    }

    const connectorLogoUrl = getObjPath(_activity, 'Context.connector.host.connectorLogoUrl');

    if (connectorLogoUrl) _activity.Response.Data.thumbnail = connectorLogoUrl;

    const proxySettings = _activity.Context.ProxyServer;

    if (proxySettings && proxySettings.EnableProxyServer) {
      const agent = {
        ca: proxySettings.certificateFile ? [await readFile(proxySettings.certificateFile)] : undefined,
        proxy: {
          host: proxySettings.host
        }
      };

      if (proxySettings.port) agent.proxy.port = proxySettings.port;

      if (proxySettings.username && proxySettings.password) {
        agent.proxy.proxyAuth = `${proxySettings.username}:${proxySettings.password}`;
      } else if (proxySettings.username) {
        agent.proxy.proxyAuth = proxySettings.username;
      } else if (proxySettings.password) {
        agent.proxy.proxyAuth = proxySettings.password;
      }

      if (_activity.Context.connector.endpoint && _activity.Context.connector.endpoint.includes('https://')) {
        _activity.Context.ProxyServer.agent = tunnel.httpsOverHttp(agent);
      } else {
        _activity.Context.ProxyServer.agent = tunnel.httpOverHttp(agent);
      }
    }

    global.$ = {
      pagination: (activity) => {
        return pagination(activity);
      },
      dateRange: (activity, defaultRange) => {
        return dateRange(activity, defaultRange);
      },
      handleError: (activity, error) => {
        return handleError(activity, error);
      },
      compare: require('./compare'),
      getObjPath: getObjPath,
      isErrorResponse: (activity, response, successStatusCodes) => {
        // optional provide list of success status codes
        if (successStatusCodes === undefined) successStatusCodes = [200];
        if (response && successStatusCodes.indexOf(response.statusCode) >= 0) return false;

        // server did not return successStatusCode
        activity.Response.ErrorCode = response.statusCode || 500;
        activity.Response.Data = {
          ErrorText: 'request failed with statusCode ' + activity.Response.ErrorCode
        };

        logger.error(activity.Response.Data.ErrorText);

        return true;
      },
      selectionError: (activity, message) => {
        activity.Response.ErrorCode = 500;
        activity.Response.Data = {
          ErrorText: message
        };
      },
      avatarLink: (text, email) => {
        let baseUrl = _activity.Context.connector.host.baseUrl;

        if (baseUrl.charAt(baseUrl.length - 1) !== '/') baseUrl += '/';

        if (!text) return `${baseUrl}avatar`;

        if (text.length > 2) {
          const split = text.split(' ');
          text = '';

          for (let i = 0; i < split.length && i < 3; i++) {
            if (split[i] && split[i][0]) text += split[i][0];
          }
        }

        const platformAvatar = `${baseUrl}avatar/${encodeURIComponent(text)}`;

        if (!email || (typeof email !== 'string' && !(email instanceof String)) || !isAscii.test(text)) return platformAvatar;

        const gravatarBaseUrl = 'https://www.gravatar.com/avatar/';
        const md5 = crypto.createHash('md5');

        email = email.toLowerCase().trim();

        const hash = md5.update(email).digest('hex');

        return `${gravatarBaseUrl}${hash}?s=192&d=${encodeURIComponent(platformAvatar)}`;
      }
    };

    global.T = (activity, key, ...args) => {
      function _format(format, args) {
        // replace {n}
        let fmt = format.replace(/{(\d+)}/g, (match, number) => {
          return typeof args[number] !== 'undefined' ? args[number] : match;
        });

        // replace [n]
        fmt = fmt.replace(/\[(\d+)\]/g, (match, number) => {
          return typeof args[number] !== 'undefined' ? args[number] : match;
        });

        return fmt;
      }

      if (key === null || key === undefined) return key;

      let msg;

      if (!msg && activity.Context.Translations) msg = activity.Context.Translations[key];
      if (!msg) msg = key; // fallback to key if no msg is available

      return _format(msg, args);
    };
  }
};
