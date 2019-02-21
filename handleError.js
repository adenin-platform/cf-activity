'use strict';

const logger = require('@adenin/cf-logger');

/**
 * logs the error and generates generic error response
 * @param {object} activity - the activity context
 * @param {error} error - the JavaScript error object
 */

module.exports = (activity, error) => {
  logger.error(error);

  let m = error.message;

  if (error.stack) {
    m = m + ': ' + error.stack;
  }

  activity.Response.ErrorCode = (error.response && error.response.statusCode) || 500;
  activity.Response.Data = {
    ErrorText: m
  };
};
