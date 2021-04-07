'use strict';

const get = require('lodash.get');

const $ports = require('./ports.js');

const $parameters = parameters => {
  if (parameters.length === 0) {
    return '';
  }
  const maxLength = parameters.reduce((res, p) => Math.max(res, p.name.length), 0);
  const res = parameters.map(p => '  parameter ' + p.name.padEnd(maxLength) + ' = ' + p.value);
  return '#(\n' + res.join(',\n') + '\n)';
};

const $module = (name, parameters, ports, body) => `\
module ${name} ${parameters} ${ports};
${body}
endmodule // ${name}
`;

const $ = {
  module: $module,
  ports: $ports,
  parameters: $parameters
};

function generate (duh, body) {
  const comp = get(duh, 'component', {});
  const name = get(comp, 'name', 'noname');
  const ports = get(comp, 'model.ports', {});
  const parameters = get(comp, 'parameters', []);
  const bis = get(comp, 'busInterfaces', []);
  return $.module(name, $.parameters(parameters), $.ports(ports, bis), body || '');
}

module.exports = generate;
