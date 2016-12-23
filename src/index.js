/**
 * Schemats takes sql database schema and creates corresponding typescript definitions
 * Created by xiamx on 2016-08-10.
 */
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const typescript_1 = require("./typescript");
const typescript_formatter_1 = require("typescript-formatter");
function typescriptOfTable(db, table) {
    return __awaiter(this, void 0, void 0, function* () {
        let interfaces = '';
        let tableTypes = yield db.getTableTypes(table);
        interfaces += typescript_1.generateTableTypes(table, tableTypes);
        interfaces += typescript_1.generateTableInterface(table, tableTypes);
        return interfaces;
    });
}
exports.typescriptOfTable = typescriptOfTable;
function extractCommand(args, dbConfig) {
    return args
        .slice(2)
        .join(' ')
        .replace(dbConfig.split('@')[0], 'postgres://username:password'); // hide real username:password pair
}
exports.extractCommand = extractCommand;
function getTime() {
    let padTime = (value) => `0${value}`.slice(-2);
    let time = new Date();
    const yyyy = time.getFullYear();
    const MM = padTime(time.getMonth() + 1);
    const dd = padTime(time.getDate());
    const hh = padTime(time.getHours());
    const mm = padTime(time.getMinutes());
    const ss = padTime(time.getSeconds());
    return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
}
exports.getTime = getTime;
function typescriptOfSchema(db, namespace, tables, schema = 'public', commandRan, time) {
    return __awaiter(this, void 0, void 0, function* () {
        if (tables.length === 0) {
            tables = yield db.getSchemaTables(schema);
        }
        const interfacePromises = tables.map((table) => typescriptOfTable(db, table));
        const interfaces = yield Promise.all(interfacePromises)
            .then(tsOfTable => tsOfTable.reduce((init, tsOfTable) => init + tsOfTable, ''));
        let output = `
            /**
             * AUTO-GENERATED FILE @ ${time} - DO NOT EDIT!
             *
             * This file was generated with schemats node package:
             * $ schemats ${commandRan}
             *
             * Re-run the command above.
             *
             */
            export namespace ${namespace} {
            ${interfaces}
            }
        `;
        let formatterOption = {
            replace: false,
            verify: false,
            tsconfig: true,
            tslint: true,
            editorconfig: true,
            tsfmt: true
        };
        const processedResult = yield typescript_formatter_1.processString('schema.ts', output, formatterOption);
        return processedResult.dest;
    });
}
exports.typescriptOfSchema = typescriptOfSchema;
var schema_1 = require("./schema");
exports.Database = schema_1.Database;
