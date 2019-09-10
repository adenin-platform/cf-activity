'use strict';

/**
 * retrieves dateRange from activity if provided or provides default values
 * @param {Object} activity - the activity context
 * @param {string} defaultRange - default verbose date range today|tomorrow
 */

module.exports = (activity, defaultRange) => {


  const inputStartDate = activity.Request.Query.startDate;
  const inputEndDate = activity.Request.Query.endDate;

  let start = null;
  let end = null;

  // use named defaults if no parameters are provided
  if (!inputStartDate || !inputEndDate) {

    // do not filter if no default is provided (return min/max date)
    if (defaultRange === undefined) {

      start = new Date('1800-01-01T00:00:00Z');
      end = new Date('2199-12-31T23:59:59Z');

    } else {

      switch (defaultRange) {

        case "today":
          const today = new Date();
          start = (new Date(today.setHours(0, 0, 0, 0)));
          end = (new Date(today.setHours(23, 59, 0, 0)));
          break;
      }

    }

  }


  // *todo* set hours only if not provided already in string

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
    date = new Date(inputYear, parseInt(inputMonth) - 1, inputDate);
  } catch (error) {
    $.handleError(activity, error);
  }

  return date;
}
