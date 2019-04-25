'use strict';

module.exports = {
  /**
  * sorts two items by date, oldest first. Expects both to have a property 'date' with valid date string
  * @param {Object} a - the first item to compare
  * @param {Object} b - the second item to compare
  */
  dateAscending: (a, b) => {
    a = new Date(a.date);
    b = new Date(b.date);

    return a < b ? -1 : (a > b ? 1 : 0);
  },
  /**
  * sorts two items by date, newest first. Expects both to have a property 'date' with valid date string
  * @param {Object} a - the first item to compare
  * @param {Object} b - the second item to compare
  */
  dateDescending: (a, b) => {
    a = new Date(a.date);
    b = new Date(b.date);

    return a > b ? -1 : (a < b ? 1 : 0);
  }
};
