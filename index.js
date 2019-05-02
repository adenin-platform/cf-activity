'use strict';

// initializers
const localization = require('./initializers/localization');
const proxy = require('./initializers/proxy');

// helpers
const compare = require('./helpers/compare');
const dateRange = require('./helpers/dateRange');
const getObjPath = require('./helpers/getObjPath');
const handleError = require('./helpers/handleError');
const isErrorResponse = require('./helpers/isErrorResponse');
const isResponseOk = require('./helpers/isResponseOk');
const pagination = require('./helpers/pagination');

module.exports = {

  // legacy
  handleError: handleError,
  isResponseOk: isResponseOk,
  dateRange: dateRange,
  pagination: pagination,
  // end legacy

  initialize: (_activity) => {
    // fetch the translations
    localization.fetchTranslations(_activity);

    // configure proxy settings
    proxy.initialize(_activity.Context);

    // global collection of helper functions
    global.$ = {
      dateRange: dateRange,
      handleError: handleError,
      pagination: pagination,
      compare: compare,
      getObjPath: getObjPath,
      isErrorResponse: isErrorResponse
    };

    // make translation function global
    global.T = localization.translate;
  }
};
