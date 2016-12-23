/**
 * Generate typescript interface from table schema
 * Created by xiamx on 2016-08-10.
 */
"use strict";
function columnNameIsReservedKeyword(columnName) {
    const reservedKeywords = [
        'string',
        'number'
    ];
    return reservedKeywords.indexOf(columnName) !== -1;
}
function normalizeColumnName(columnName) {
    if (columnNameIsReservedKeyword(columnName)) {
        return columnName + '_';
    }
    else {
        return columnName;
    }
}
function generateTableInterface(tableName, schema) {
    let members = '';
    for (let columnName in schema) {
        if (schema.hasOwnProperty(columnName)) {
            members += `${columnName}: ${tableName}Fields.${normalizeColumnName(columnName)};\n`;
        }
    }
    return `
        export interface ${tableName} {
        ${members}
        }
    `;
}
exports.generateTableInterface = generateTableInterface;
function generateTableTypes(tableName, tableDefinition) {
    let fields = '';
    for (let columnName in tableDefinition) {
        if (tableDefinition.hasOwnProperty(columnName)) {
            let type = tableDefinition[columnName];
            fields += `export type ${normalizeColumnName(columnName)} = ${type};\n`;
        }
    }
    return `
        export namespace ${tableName}Fields {
        ${fields}
        }
    `;
}
exports.generateTableTypes = generateTableTypes;
