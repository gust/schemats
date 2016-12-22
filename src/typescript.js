/**
 * Generate typescript interface from table schema
 * Created by xiamx on 2016-08-10.
 */
"use strict";
function generateTableInterface(tableName, schema) {
    let members = '';
    for (let columnName in schema) {
        if (schema.hasOwnProperty(columnName)) {
            members += `${columnName}: ${tableName}Fields.${columnName};\n`;
        }
    }
    return `
        export interface ${tableName} {
        ${members}
        }
    `;
}
exports.generateTableInterface = generateTableInterface;
function generateSchemaTypes(tableName, schema) {
    let fields = '';
    for (let columnName in schema) {
        if (schema.hasOwnProperty(columnName)) {
            let type = schema[columnName];
            fields += `export type ${columnName} = ${type};\n`;
        }
    }
    return `
        export namespace ${tableName}Fields {
        ${fields}
        }
    `;
}
exports.generateSchemaTypes = generateSchemaTypes;
