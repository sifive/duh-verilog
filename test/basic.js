'use strict';

const chai = require('chai');

const lib = require('../lib/index.js');

const expect = chai.expect;
const generate = lib.generate;

const data = {
  noname: {
    source: {component: {}},
    result: `\
module noname  (

);
// noname
endmodule // noname
`
  },
  b1: {
    source: {component: {
      name: 'b1', model: {ports: {
        clock: 1, reset_n: 1, irq: -1
      }}
    }},
    result: `\
module b1  (
  input   clock,
  input   reset_n,
  output  irq
);
// b1
endmodule // b1
`
  },
  bar: {
    source: {component: {
      name: 'bar', model: {ports: {
        clock: 1, reset_n: 1, t_req: 1, t_ack: -1, t_dat: 'datWidth'
      }}
    }},
    result: `\
module bar  (
  input                 clock,
  input                 reset_n,
  input                 t_req,
  output                t_ack,
  input  [datWidth-1:0] t_dat
);
// bar
endmodule // bar
`
  },
  b3: {
    source: {component: {
      name: 'b3', model: {ports: {
        clk: 1, reset_n: 1, wren: 1, rden: 1, addr: 16, wrdata: 'dataWidth', rddata: '-dataWidth'
      }},
      busInterfaces: [{
        name: 't', interfaceMode: 'slave',
        busType: {vendor: 'sifive.com', library: 'MEM', name: 'SPRAM', version: '0.1.0'},
        abstractionTypes: [{
          viewRef: 'RTLview', portMaps: {
            CLK: 'clk', WREN: 'wren', RDEN: 'rden', ADDR: 'addr',
            WRDATA: 'wrdata', RDDATA: 'rddata'
          }
        }]
      }, {
        name: 'c', interfaceMode: 'slave',
        busType: {vendor: 'sifive.com', library: 'PRCI', name: 'CLOCK', version: '0.1.0'},
        abstractionTypes: [{
          viewRef: 'RTLview', portMaps: {CLOCK: 'clk'}
        }]
      }]
    }},
    result: `\
module b3  (
  input                  clk     /* t:CLK, c:CLOCK */,
  input                  reset_n,
  input                  wren    /* t:WREN */,
  input                  rden    /* t:RDEN */,
  input           [15:0] addr    /* t:ADDR */,
  input  [dataWidth-1:0] wrdata  /* t:WRDATA */,
  output [dataWidth-1:0] rddata  /* t:RDDATA */
);
// b3
endmodule // b3
`
  }
};

describe('generate', () => {
  Object.keys(data).map(key => {
    it(key, async () => {
      expect(generate(data[key].source, '// ' + key)).to.eq(data[key].result);
    });
  });
});

/* eslint-env mocha */
