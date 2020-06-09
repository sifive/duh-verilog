'use strict';

const range = max => '[' + max + ':0]';

module.exports = size => {
  if (typeof size === 'number') {
    return Math.abs(size) > 1 ? range(Math.abs(size) - 1) : '';
  }
  if (typeof size === 'string') {
    return range((
      (size.slice(0, 1) === '-')
        ? size.slice(1)
        : size
    ) + '-1');
  }
  return range(size + '-1');
};
