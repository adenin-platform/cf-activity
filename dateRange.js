'use strict';

const logger = require('@adenin/cf-logger');

/**
 * retrieves dateRange from activity if provided or provides default values
 * @param {Object} activity - the activity context
 * @param {string} defaultRange - default verbose date range today|tomorrow  
 */

module.exports = (activity, defaultRange) => {

    // optional: provide named default range
    if (defaultRange == undefined) defaultRange = "today";

    // just a PoC - todo: add validation, more ranges, support date only ... 
    var start = activity.Request.Query.startDate;
    var end = activity.Request.Query.endDate;

    if (!start || !end || start.length != 24 || end.length != 24) {
        const today = new Date();
        start = (new Date(today.setHours(0, 0, 0, 0))).toISOString();
        end = (new Date(today.setHours(23, 59, 0, 0))).toISOString();
    }

    return {
      startDate: start,
      endDate: end
    }
};
