'use strict';

const get = require('lodash.get');

const vectorDim = require('./vector-dim.js');

const maxer = (res, e) => Math.max(e.length, res);

const dir = val => {
  if (typeof val === 'number') {
    return (val > 0) ? 'input ' : 'output';
  }
  if (typeof val === 'string') {
    return (val.slice(0, 1) === '-') ? 'output' : 'input ';
  }
};

const perBi = (res, bi) => {
  const biName = get(bi, 'name', 'noname');
  const portMaps = get(bi, 'abstractionTypes[0].portMaps', {});
  Object.keys(portMaps).map(lname => {
    const pname = portMaps[lname];
    if (res[pname] === undefined) {
      res[pname] = [];
    }
    res[pname].push({biName: biName, logicName: lname});
  });
  return res;
};

module.exports = (ports, bis) => {
  const keys = Object.keys(ports);
  const maxKey = keys.reduce(maxer, 0);
  const alignKeys = keys.map(e => e.padEnd(maxKey));

  const dims = keys.map(key => vectorDim(ports[key]));
  const maxDim = dims.reduce(maxer, 0);
  const alignDims = dims.map(e => e.padStart(maxDim));

  const mapings = bis.reduce(perBi, {});

  const comments = keys.map(e => {
    const val = mapings[e];
    if (val === undefined) {
      return;
    }
    return (
      '/* ' +
      get(mapings, e, []).map(e => e.biName + ':' + e.logicName).join(', ') +
      ' */'
    );
  });
  return '(\n' + keys.map((e, i) => {
    const comment = comments[i];
    return (
      '  ' + dir(ports[e]) + ' ' + alignDims[i] + ' ' +
      ((comment === undefined) ? e : (alignKeys[i] + ' ' + comments[i]))
    );
  }).join(',\n') + '\n)';
};
