'use strict';

module.exports = (catalog, design) => {
  const {vendor, library, name, version} = design;
  let res = [];
  res.push('// ' + [vendor, library, name, version].join(':'));
  design.instances.map(e => {
    res.push('// instance ' + e.name);
  });
  return res.join('\n');
};
