'use strict';

const logger = require('@adenin/cf-logger');

/**
 * ensures that response returned status 200 OK, log
 * @param {Object} activity - the activity context
 * @param {Object} response - the got api response
 * @param {Number[]} succssStatusCodes - optional array of statusCode recognized as success, default [200]
 */

module.exports = (activity, response, succssStatusCodes) => {
  // optional provide list of success status codes
  if (succssStatusCodes === undefined) {
    succssStatusCodes = [200];
  }

  if (response && succssStatusCodes.indexOf(response.statusCode) >= 0) {
    return true;
  }

  // server did not return status 200
  activity.Response.ErrorCode = response.statusCode || 500;
  activity.Response.Data = {
    ErrorText: 'request failed with statusCode ' + activity.Response.ErrorCode
  };

  logger.error(activity.Response.Data.ErrorText);

  return false;
};
