'use strict';

const chai = require('chai');

const lib = require('../lib/index.js');

const expect = chai.expect;
const generate = lib.generate;

describe('basic', () => {
  it('b1', done => {
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
    done();
  });
});

/* eslint-env mocha */
