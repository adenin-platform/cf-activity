'use strict';

const decache = require('decache');
const fs = require('fs');
const path = require('path');

module.exports = {
  fetchTranslations: (activity) => {
    const lang = (activity.Context.UserLocale || 'en-US').split('-');
    const fname = activity.Context.ScriptFolder + path.sep + 'lang' + path.sep + lang[0] + '.json';

    activity.Context.Translations = null;

    if (fs.existsSync(fname)) {
      if (process.env.NODE_ENV === 'development') decache(fname);

      activity.Context.Translations = require(fname);
    }
  },
  translate: (activity, key, ...args) => {
    if (key === null || key === undefined) return key;

    let msg;

    if (!msg && activity.Context.Translations) msg = activity.Context.Translations[key];
    if (!msg) msg = key; // fallback to key if no msg is available

    return format(msg, args);
  }
};

function format(format, args) {
  // replace {n}
  let fmt = format.replace(/{(\d+)}/g, (match, number) => {
    return typeof args[number] !== 'undefined' ? args[number] : match;
  });

  // replace [n]
  fmt = fmt.replace(/\[(\d+)\]/g, (match, number) => {
    return typeof args[number] !== 'undefined' ? args[number] : match;
  });

  return fmt;
}
