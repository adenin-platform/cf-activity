'use strict';

const logger = require('@adenin/cf-logger');

/**
 * retrieves pagination parameters from activity if provided or provides default values, initializes response
 * @param {Object} activity - the activity context 
 */

module.exports = (activity) => {

    var action = "firstpage";
    let page = parseInt(activity.Request.Query.page) || 1;
    let pageSize = parseInt(activity.Request.Query.pageSize) || 20;

    // nextpage request
    if ((activity.Request.Data && activity.Request.Data.args && activity.Request.Data.args.atAgentAction == "nextpage")) {
        page = parseInt(activity.Request.Data.args._page) || 2;
        pageSize = parseInt(activity.Request.Data.args._pageSize) || 20;
        action = "nextpage";
    }

    if (page < 0) page = 1;
    if (pageSize < 1 || pageSize > 99) pageSize = 20;

    // initialize response
    activity.Response.Data._action = action;
    activity.Response.Data._page = page;
    activity.Response.Data._pageSize = pageSize;
    activity.Response.Data.items = [];


    return {
        page: page,
        pageSize: pageSize
    }
};
