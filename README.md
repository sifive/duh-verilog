[![NPM version](https://img.shields.io/npm/v/duh-verilog.svg)](https://www.npmjs.org/package/duh-verilog)
[![](https://github.com/sifive/duh-verilog/workflows/Node%20CI/badge.svg)](https://github.com/sifive/duh-verilog/actions)
[![Coverage Status](https://coveralls.io/repos/github/sifive/duh-verilog/badge.svg?branch=master)](https://coveralls.io/github/sifive/duh-verilog?branch=master)

Verilog generator from DUH document

## Install

```
npm i duh-verilog
```

## Usage

```js
const duhVerilog = require('duh-verilog');

duhVerilog.generate({
  component: {
    name: 'empty',
    model: {ports: {clock: 1, reset_n: 1, irq: -1}}
  }
})
/* =>
module empty (
  input                                      clock,
  input                                      reset_n,
  output logic                               irq
);
endmodule
*/

```
