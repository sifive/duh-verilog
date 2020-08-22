'use strict';

const chai = require('chai');

const designBody = require('../lib/design-body.js');

const expect = chai.expect;

const data = {
  d0: {
    source: {
      catalog: {},
      design: {
        vendor: 'ven', library: 'l1', name: 'd0', version: 'v1',
        instances: [],
        connections: []
      }
    },
    result: '// ven:l1:d0:v1'
  },
  d1: {
    source: {
      catalog: {},
      design: {
        vendor: 'ven', library: 'l1', name: 'd1', version: 'v1',
        instances: [{
          name: 'u0', ref: {
            vendor: 'ven', library: 'l1', name: 'c1', version: 'v1'
          }
        }],
        connections: []
      }
    },
    result: `\
// ven:l1:d1:v1
// instance u0`
  }
};

describe('generate', () => {
  Object.keys(data).map(key => {
    it(key, async () => {
      expect(designBody(data[key].source.catalog, data[key].source.design))
        .to.eq(data[key].result);
    });
  });
});

/* eslint-env mocha */
