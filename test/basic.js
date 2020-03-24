'use strict';

const chai = require('chai');

const lib = require('../lib/index.js');

const expect = chai.expect;
const generate = lib.generate;

describe('basic', () => {

  it('noname', async () => {
    expect(generate({
      component: {}
})).to.eq(`\
module noname (

);
endmodule
`);
  });

  it('b1', async () => {
    expect(generate({
      component: {
        name: 'simple',
        model: {ports: {clock: 1, reset_n: 1, irq: -1}}
      }
})).to.eq(`\
module simple (
  input                                      clock,
  input                                      reset_n,
  output logic                               irq
);
endmodule
`);
  });

  it('b2', async () => {
    expect(generate({
      component: {
        name: 'simple',
        model: {
          ports: {
            clock: 1, reset_n: 1,
            t_req: 1, t_ack: -1, t_dat: 'datWidth'
          }
        }
      }
})).to.eq(`\
module simple (
  input                                      clock,
  input                                      reset_n,
  input                                      t_req,
  output logic                               t_ack,
  output logic                [datWidth-1:0] t_dat
);
endmodule
`);
  });

});

/* eslint-env mocha */
