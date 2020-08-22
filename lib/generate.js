'use strict';

const get = require('lodash.get');

const $ports = require('./ports.js');

const $module = (name, ports, body) => `\
module ${name} ${ports};
${body}
endmodule // ${name}
`;

const $ = {
  module: $module,
  ports: $ports
};

function generate (duh, body) {
  const comp = get(duh, 'component', {});
  const name = get(comp, 'name', 'noname');
  const ports = get(comp, 'model.ports', {});
  const bis = get(comp, 'busInterfaces', []);
  return $.module(name, $.ports(ports, bis), body || '');
}

module.exports = generate;
