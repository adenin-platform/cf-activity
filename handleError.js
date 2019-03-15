'use strict';

const logger = require('@adenin/cf-logger');

/**
 * logs the error and generates generic error response
 * @param {object} activity - the activity context
 * @param {error} error - the JavaScript error object
 * @param {Number[]} authRequiresStatusCodes - optional array of statusCode recognized as success, default for token based auth [401]
 */

module.exports = (activity, error, authRequiresStatusCodes) => {
  if (authRequiresStatusCodes === undefined) {
    // if OAuth2 tokens are used status 401 should be mapped to 461 auth required
    if (activity.Context.connector.token) {
      authRequiresStatusCodes = [401];
    } else {
      authRequiresStatusCodes = [];
    }
  }

  if (error.response && error.response.statusCode && authRequiresStatusCodes.indexOf(error.response.statusCode) >= 0) {
    error.response.statusCode = 461;
  } else {
    logger.error(error);
  }

  let m = error.message;

  if (error.stack) {
    m = m + ': ' + error.stack;
  }

  activity.Response.ErrorCode = (error.response && error.response.statusCode) || 500;
  activity.Response.Data = {
    ErrorText: m
  };
};
