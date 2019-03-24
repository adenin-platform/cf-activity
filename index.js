'use strict';
const path = require('path');
const fs = require('fs');

var handleError = require('./handleError');
var isResponseOk = require('./isResponseOk');
var dateRange = require('./dateRange');
var pagination = require('./pagination');

module.exports = {

  // legacy exports
  handleError: handleError,
  isResponseOk: isResponseOk,
  dateRange: dateRange,
  pagination: pagination,

  makeGlobal: function (activity) {

    var _activity = activity;

    var lang = (activity.Context.UserLocale || "en-US").split("-");
    var fname = activity.Context.ScriptFolder + path.sep + 'lang' + path.sep + lang[0] + '.json';
  
    global.Translations = null;
    if (fs.existsSync(fname)) {
      global.Translations = require(fname);
    }

    global.Activity = {
      Request: activity.Request,
      Response: activity.Response,
      Context: activity.Context,

      pagination: function () {
        return pagination(_activity);
      },

      dateRange: function (defaultRange) {
        return dateRange(_activity, defaultRange);
      },

      handleError: function (error) {
        return handleError(_activity, error);
      },

      isErrorResponse: function (response, successStatusCodes) {

        // optional provide list of success status codes
        if (successStatusCodes === undefined) {
          successStatusCodes = [200];
        }

        if (response && successStatusCodes.indexOf(response.statusCode) >= 0) {
          return false;
        }

        // server did not return successStatusCode
        _activity.Response.ErrorCode = response.statusCode || 500;
        _activity.Response.Data = {
          ErrorText: 'request failed with statusCode ' + _activity.Response.ErrorCode
        };

        logger.error(_activity.Response.Data.ErrorText);

        return true;
      }
    };

    global.T = function (key) {

      function _format(format, args) {

        // replace {n}
        var fmt = format.replace(/{(\d+)}/g, function (match, number) {
          return typeof args[number] != 'undefined' ? args[number] : match;
        });

        // replace [n]
        fmt = fmt.replace(/\[(\d+)\]/g, function (match, number) {
          return typeof args[number] != 'undefined' ? args[number] : match;
        });

        return fmt;
      }

      if (key === null || key === undefined) return key;
      var args = Array.prototype.slice.call(arguments, 1);
      var msg = undefined;
      if (!msg && global.Translations) msg = global.Translations[key]; // check for module specific msg      
      if (!msg) msg = key; // fallback to key if no msg is available

      return _format(msg, args);
    }
  }
};
