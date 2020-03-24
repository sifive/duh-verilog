'use strict';

const get = require('lodash.get');
const vectorDim = require('./vector-dim.js');

const dir = val => (val > 0)
  ? 'input       '
  : 'output logic';

const perPort = (key, val) =>
  `  ${dir(val)} ${vectorDim(val)}${key}`;

const $ = {
  module: (name, ports, body) => `\
module ${name} ${ports};
${body}\
endmodule
`,
  ports: ports => '(\n' +
    Object
      .keys(ports)
      .map(key => perPort(key, ports[key]))
      .join(',\n')
    + '\n)'
};

module.exports = duh => {
  const comp = get(duh, 'component', {});
  const name = get(comp, 'name', 'noname');
  const ports = get(comp, 'model.ports', {});
  return $.module(name, $.ports(ports), '');
};
