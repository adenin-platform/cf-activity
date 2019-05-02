'use strict';

/**
 * Check if a nested key is defined on an object
 * @param {Object} obj - the object on which to check for the key
 * @param {Object} path - the path to the nested key to check for
 */
module.exports = (obj, path) => {
  if (!path) return obj;
  if (!obj) return null;

  const paths = path.split('.');
  let current = obj;

  for (let i = 0; i < paths.length; ++i) {
    if (!current[paths[i]]) return undefined;

    current = current[paths[i]];
  }

  return current;
};
