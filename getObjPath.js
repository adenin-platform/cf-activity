'use strict';

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
