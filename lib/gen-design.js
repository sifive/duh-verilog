'use strict';

const duhCore = require('duh-core');
const duhBus = require('duh-bus');

const vectorDim = require('./vector-dim.js');
const vectorSlice = require('./vector-slice.js');

const getBusDef = duhCore.getGetBusDef(duhBus);

const rtlModule = () => {
  const wiro = {};
  const instanco = {};
  return {
    wire: props => {
      const {name, width, value, comment} = props;
      if (!name) {
        throw new Error('wire "' + name + '" is incorrect name');
      }
      if (wiro[name] !== undefined) {
        throw new Error('wire ' + name + ' is already defined');
      }
      wiro[name] = {width, value, comment};
    },
    instance: props => {
      const {name, kind, comment} = props;
      if (!name) {
        throw new Error('instance "' + name + '" is incorrect name');
      }
      if (instanco[name] !== undefined) {
        throw new Error('instance ' + name + ' is already defined');
      }
      instanco[name] = {kind, comment, ports: {}};
    },
    connect: props => {
      const {name, port, value, comment} = props;
      if (!name) {
        throw new Error('instance "' + name + '" is incorrect name');
      }
      const instance = instanco[name];
      if (instance === undefined) {
        throw new Error('the instance "' + name + '" is not defined');
      }
      if (instance.ports[port] !== undefined) {
        throw new Error('the port "' + port + '" of instance "' + name + '" is already defined');
      }
      instance.ports[port] = {value, comment};
    },
    verilog: () => [].concat(
      Object.keys(wiro).map(name => {
        const el = wiro[name];
        const dim = vectorDim(el.width).padStart(12);
        const assign = ((el.value === undefined) ? '' : ' = ' + verilogLiteral(el.value, el.width));
        const comment = ((el.comment) ? (' // ' + el.comment) : '');
        return 'wire ' + dim + ' ' + name + assign + ';' + comment;
      }),
      Object.keys(instanco).map(name => {
        const el = instanco[name];
        const ports = Object.keys(el.ports).map(port => {
          const val = el.ports[port];
          const comment = val.comment ? ' /* ' + val.comment + ' */ ' : '';
          const value = val.value || '';
          return '  .' + port + ' (' + value + ')' + comment;
        }).join(',\n');
        const comment = el.comment ? ' // ' + el.cooment : '';
        return el.kind + ' ' + name + ' (\n' + ports + '\n);' + comment;
      })
    ).join('\n')
  };
};

const $ = rtlModule();

const verilogLiteral = (value, width) =>
  Math.abs(width) + '\'b' + (value & (Math.pow(2, width) - 1)).toString(2);

const getBusType = (instances, iname) => {
  const inst = instances.find(e => e.name === iname);
  if (inst === undefined) {
    throw new Error('unknown instance name: ' + iname + 'in array of instances: ' + JSON.stringify(instances, null, 2));
  }
  return inst.ref;
};

const connect = (initiator, target, prefix) => {
  const porto = target.busDef.abstractionDefinition.ports;
  const lNames = Object.keys(porto);

  const [iPortMaps, tPortMaps] = [initiator, target].map(e => {
    const ports = e.comp.model.ports;
    const portMaps = e.bi.abstractionTypes.find(e => e.viewRef === 'RTLview').portMaps;
    const widthMaps = Object.keys(portMaps).reduce((res, lName) => {
      const pName = portMaps[lName];
      res[lName] = {name: pName, value: Number(ports[pName])};
      return res;
    }, {});
    return widthMaps;
  });

  lNames.map(lName => {
    const wName = prefix + '_' + lName.toLowerCase();
    const defaultValue = porto[lName].wire.defaultValue || 0;
    const i = iPortMaps[lName];
    const t = tPortMaps[lName];
    if ((i === undefined) & (t === undefined)) {
      return;
    }
    if ((i !== undefined) & (t === undefined)) {
      if (i.value > 0) {
        $.connect({
          name: initiator.iName,
          port: i.name,
          value: verilogLiteral(defaultValue, i.value)
        });
      }
      return;
    }
    if ((i === undefined) & (t !== undefined)) {
      if (t.value > 0) {
        $.connect({
          name: target.iName,
          port: t.name,
          value: verilogLiteral(defaultValue, t.value)
        });
      }
      return;
    }
    if ((i !== undefined) & (t !== undefined)) {
      const [iW, tW] = [i, t].map(e => Math.abs(e.value));
      $.wire({
        name: wName,
        width: Math.max(iW, tW),
        comment: (iW === tW) ? undefined : iW + ' -> ' + tW
      });
      $.connect({
        name: initiator.iName,
        port: i.name,
        value: wName + ((iW === tW) ? '' : vectorSlice(iW))
      });
      $.connect({
        name: target.iName,
        port: t.name,
        value: wName + ((iW === tW) ? '' : vectorSlice(tW))
      });
      return;
    }
  });
};

const _import = (target, prefix) => {
  const porto = target.busDef.abstractionDefinition.ports;
  const lNames = Object.keys(porto);

  const [tPortMaps] = [target].map(e => {
    const ports = e.comp.model.ports;
    const portMaps = e.bi.abstractionTypes.find(e => e.viewRef === 'RTLview').portMaps;
    const widthMaps = Object.keys(portMaps).reduce((res, lName) => {
      const pName = portMaps[lName];
      res[lName] = {name: pName, value: Number(ports[pName])};
      return res;
    }, {});
    return widthMaps;
  });
  lNames.map(lName => {
    const wName = prefix + '_' + lName.toLowerCase();
    const t = tPortMaps[lName];
    if (t === undefined) {
      return;
    }
    $.connect({
      name: target.iName,
      port: t.name,
      value: wName
    });
  });
};

const _export = (source, prefix) => {
  const porto = source.busDef.abstractionDefinition.ports;
  const lNames = Object.keys(porto);

  const [iPortMaps] = [source].map(e => {
    const ports = e.comp.model.ports;
    const portMaps = e.bi.abstractionTypes.find(e => e.viewRef === 'RTLview').portMaps;
    const widthMaps = Object.keys(portMaps).reduce((res, lName) => {
      const pName = portMaps[lName];
      res[lName] = {name: pName, value: Number(ports[pName])};
      return res;
    }, {});
    return widthMaps;
  });
  lNames.map(lName => {
    const wName = prefix + '_' + lName.toLowerCase();
    const i = iPortMaps[lName];
    if (i === undefined) {
      return;
    }
    $.connect({
      name: source.iName,
      port: i.name,
      value: wName
    });
  });
};


const connector = catalog => design => {
  const components = catalog.components;
  const instances = design.instances || [];

  const getDescriptor = e => {
    const [iName, biName] = e;
    const cType = getBusType(instances, iName);
    const comp = duhCore.findVLNV(components, 'component', cType);
    const bi = (comp.busInterfaces || []).find(e => e.name === biName);
    const aBusType = duhCore.aVLNV(bi.busType);
    const busDef = getBusDef(bi.busType);
    // console.log(busDef);
    const res = {iName, cType, comp, bi, aBusType, busDef};
    return res;
  };

  return (e, i) => {
    if (e.import) {
      _import(getDescriptor(e.target), e.import);
    } else
    if (e.export) {
      _export(getDescriptor(e.source), e.export);
    } else {
      connect(getDescriptor(e.source), getDescriptor(e.target), 'edge' + i);
    }
  };
};

const instancer = ( /* catalog */ ) => {
  // const components = catalog.components || [];
  return ( /* design */ ) => inst => {
    $.instance({name: inst.name, kind: inst.ref.name});
  };
};

const genDesign = catalog => design => {
  (design.instances || []).map(instancer(catalog)(design));
  (design.connections || []).map(connector(catalog)(design));
  return $.verilog();
};

module.exports = genDesign;
