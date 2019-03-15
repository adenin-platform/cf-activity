'use strict';

/**
 * retrieves pagination parameters from activity if provided or provides default values, initializes response
 * @param {Object} activity - the activity context
 */

module.exports = (activity) => {
  let action = 'firstpage';
  let page = parseInt(activity.Request.Query.page, 10) || 1;
  let pageSize = parseInt(activity.Request.Query.pageSize, 10) || 20;
  let nextpage = activity.Request.Query.nextpage;

  if (nextpage) {
    page = null;
    action = 'nextpage';
  } else if (activity.Request.Query.page && activity.Request.Query.page.includes('_nextpage:')) {
    const raw = activity.Request.Query.page;

    page = null;
    nextpage = raw.substring(raw.indexOf(':') + 1, raw.length);
    action = 'nextpage';
  }

  // nextpage request
  if (activity.Request.Data && activity.Request.Data.args && activity.Request.Data.args.atAgentAction === 'nextpage') {
    if (activity.Request.Data.args._nextpage) {
      page = null;
      nextpage = activity.Request.Data.args._nextpage;
    } else if (activity.Request.Query.page && activity.Request.Data.args._page.includes('_nextpage:')) {
      const raw = activity.Request.Data.args._page;

      page = null;
      nextpage = raw.substring(raw.indexOf(':') + 1, raw.length);
    } else {
      page = parseInt(activity.Request.Data.args._page, 10) || 2;
    }

    pageSize = parseInt(activity.Request.Data.args._pageSize, 10) || 20;
    action = 'nextpage';
  }

  if (page < 0) {
    page = 1;
  }

  if (pageSize < 1 || pageSize > 99) {
    pageSize = 20;
  }

  if (!activity.Response.Data) {
    activity.Response.Data = {};
  }

  // initialize response
  activity.Response.Data._action = action;
  activity.Response.Data._page = page;
  activity.Response.Data._pageSize = pageSize;
  activity.Response.Data.items = [];

  return {
    page: page,
    pageSize: pageSize,
    nextpage: nextpage
  };
};
