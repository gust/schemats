import * as _ from 'lodash';
import {InterfaceMember, Interface} from './typescript';

function parseSchema(name, schema) {
  const iface = new Interface(name);
  const type = schema.type.toLowerCase();
  
  if (type === 'object') {
    
  } else if (type === 'string') {
    
  } else if (type === 'number') {
    
  }
}

export default function generate(file:string) {
  const schema = require(file);
  const interfaces = [];
}
