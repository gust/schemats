/**
 * Generate typescript interface from table schema
 * Created by xiamx on 2016-08-10.
 */

export function generateTableInterface(tableName: string, schema: Object) {
    let members = "";
    for (let columnName in schema){
        if (schema.hasOwnProperty(columnName)) {
            let type = schema[columnName];
            members += `${columnName}: ${tableName}Fields.${columnName};\n`
        }
    }

    return `
        export interface ${tableName} {
        ${members}
        }
    `
}

export function generateSchemaTypes(tableName: string, schema: Object) {
    let fields = "";
    for (let columnName in schema){
        if (schema.hasOwnProperty(columnName)) {
            let type = schema[columnName];
            fields += `export type ${columnName} = ${type};\n`
        }
    }

    return `
        export namespace ${tableName}Fields {
        ${fields}
        }
    `
}

export interface InterfaceMember {
  name:string;
  type?:string;
  optional?:boolean;
  array?:boolean;
}

export class Interface {
  private members:InterfaceMember[] = [];
  constructor(private name:string) {

  }
  addMember(member:InterfaceMember) {
    this.members.push(member);
  }
  toString() {
    const memStrs =  this.members.map((member) => {
      let memStr = `${member.name}`;

      if (member.optional) {
        memStr += '?';
      }
      if (member.type) {
        memStr += `:${member.type}`;
      }
      if (member.array) {
        memStr += '[]';
      }
      return memStr + ';'
    }).join('\n');

    return `interface ${this.name} {
${memStrs}
}`
  }
}

import {processString} from 'typescript-formatter'
let formatterOption = {
  replace: false,
  verify: true,
  tsconfig: true,
  tslint: false,
  editorconfig: true,
  tsfmt: true
};



const iface = new Interface('iface');

iface.addMember({
  name: 'name',
  type: 'string'
});

iface.addMember({
  name: 'type',
  type: 'string',
  optional: true
});

iface.addMember({
  name: 'optional',
  type: 'boolean',
  optional: true
});

processString(`iface.ts`, iface.toString(), formatterOption).then((res) => {
  console.log(res.dest)
}, (err) => {
  console.error(err, err.stack);
})
