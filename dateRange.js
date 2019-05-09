'use strict';

/**
 * retrieves dateRange from activity if provided or provides default values
 * @param {Object} activity - the activity context
 * @param {string} defaultRange - default verbose date range today|tomorrow
 */

module.exports = (activity, defaultRange) => {
  // optional: provide named default range
  if (defaultRange === undefined) defaultRange = 'today';

  const inputStartDate = activity.Request.Query.startDate;
  const inputEndDate = activity.Request.Query.endDate;

  let start = null;
  let end = null;

  if (inputStartDate) {
    start = extractDateFromString(activity, inputStartDate);
    try {
      start.setHours(0, 0, 0, 0);
    } catch (error) {
      $.handleError(activity, error);
    }
  }

  if (inputEndDate) {
    end = extractDateFromString(activity, inputEndDate);
    try {
      end.setHours(23, 59, 0, 0);
    } catch (error) {
      $.handleError(activity, error);
    }
  }

  if (!start) {
    const today = new Date();
    start = (new Date(today.setHours(0, 0, 0, 0)));
  }

  if (!end) {
    const today = new Date();
    end = (new Date(today.setHours(23, 59, 0, 0)));
  }

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString()
  };
};

function extractDateFromString(activity, input) {
  let date = null;
  let inputYear = null;
  let inputMonth = null;
  let inputDate = null;

  if (input.length === 8) {
    inputYear = input.substring(0, 4);
    inputMonth = input.substring(4, 6);
    inputDate = input.substring(6, 9);
  } else if (input.includes('-')) {
    const output = input.split('-');

    inputYear = output[0];
    inputMonth = output[1];
    inputDate = output[2];
  }

  try {
    date = new Date(inputYear, parseInt(inputMonth, 10) - 1, inputDate);
  } catch (error) {
    $.handleError(activity, error);
  }

  return date;
}
