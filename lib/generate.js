'use strict';

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
  const comp = duh.component;
  const name = comp.name;
  const ports = comp.model.ports;
  return $.module(name, $.ports(ports), '');
};
