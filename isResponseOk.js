'use strict';

const logger = require('@adenin/cf-logger');

/**
 * ensures that response returned status 200 OK, log
 * @param {object} activity - the activity context
 * @param {object} response - the got api response
 */

module.exports = (activity, response) => {
  if (response && response.statusCode === 200) {
    return;
  }

  // server did not return status 200
  activity.Response.ErrorCode = response.statusCode || 500;
  activity.Response.Data = {
    ErrorText: 'request failed with statusCode ' + activity.Response.ErrorCode
  };

  logger.error(activity.Response.Data.ErrorText);
};
