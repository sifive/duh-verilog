#!/usr/bin/env node
'use strict';

const yargs = require('yargs');
const json5 = require('json5');

const {readDuh, validateSchema} = require('duh-core');

const lib = require('../lib/index.js');

const argv = yargs
  .option('input', {
    alias: 'i', type: 'string', demandOption: true,
    describe: 'input file to load'
  })
  .option('output', {
    alias: 'o', type: 'string',
    describe: 'output path for exported files'
  })
  .option('top', {
    alias: 't', type: 'array',
    describe: 'top level design(s)'
  })
  .version()
  .help()
  .argv;

const genComponent = duh => {
  const res = lib.generate(duh);
  console.log(res);
};

const genCatalog = (duh, top) => {
  let tops;
  if (top === undefined) {
    tops = [];
  } else {
    tops = json5.parse(argv.top);
  }
  console.log(duh, tops);
};

async function main(argv) {
  const duh = await readDuh({filename: argv.input});
  await validateSchema(duh);

  if (duh.component !== undefined) { return genComponent(duh); }

  if (duh.catalog !== undefined) { return genCatalog(duh, argv.top); }

  console.log(duh);
}

main(argv);
