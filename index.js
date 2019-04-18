'use strict';

const path = require('path');
const fs = require('fs');
const decache = require('decache');

const handleError = require('./handleError');
const isResponseOk = require('./isResponseOk');
const dateRange = require('./dateRange');
const pagination = require('./pagination');

module.exports = {
  // legacy
  handleError: handleError,
  isResponseOk: isResponseOk,
  dateRange: dateRange,
  pagination: pagination,
  // end legacy
  initialize: (_activity) => {
    const lang = (_activity.Context.UserLocale || 'en-US').split('-');
    const fname = _activity.Context.ScriptFolder + path.sep + 'lang' + path.sep + lang[0] + '.json';

    _activity.Context.Translations = null;

    if (fs.existsSync(fname)) {
      if (process.env.NODE_ENV === 'development') decache(fname);

      _activity.Context.Translations = require(fname);
    }

    global.$ = {
      pagination: (activity) => {
        return pagination(activity)
      },
      dateRange: (activity, defaultRange) => {
        return dateRange(activity, defaultRange)
      },
      handleError: (activity, error) => {
        return handleError(activity, error)
      },
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
