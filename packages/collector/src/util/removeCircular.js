/* global WeakSet */

'use strict';

module.exports = exports = function createCircularReferencesRemover() {
  const seen = new WeakSet();
  return (_, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};
