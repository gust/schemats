"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const PgPromise = require("pg-promise");
const lodash_1 = require("lodash");
const pgp = PgPromise();
class Database {
    constructor(connectionString) {
        this.db = pgp(connectionString);
    }
    getTableDefinition(tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            let tableDefinition = {};
            yield this.db.each(`SELECT column_name, udt_name
            FROM information_schema.columns
            WHERE table_name = $1`, [tableName], (schemaItem) => {
                tableDefinition[schemaItem.column_name] = schemaItem.udt_name;
            });
            return tableDefinition;
        });
    }
    getTableTypes(tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.mapTableDefinitionToType(yield this.getTableDefinition(tableName));
        });
    }
    getSchemaTables(schemaName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.map(`SELECT table_name
            FROM information_schema.columns
            WHERE table_schema = $1
            GROUP BY table_name`, [schemaName], schemaItem => schemaItem.table_name);
        });
    }
    mapTableDefinitionToType(tableDefinition) {
        return lodash_1.mapValues(tableDefinition, udtName => {
            switch (udtName) {
                case 'varchar':
                case 'text':
                case 'uuid':
                case 'inet':
                    return 'string';
                case 'int2':
                case 'int4':
                case 'int8':
                case 'float8':
                case 'numeric':
                    return 'number';
                case 'bool':
                    return 'boolean';
                case 'json':
                case 'jsonb':
                    return 'Object';
                case 'date':
                case 'timestamp':
                case 'timestamptz':
                    return 'Date';
                case '_float8':
                    return 'Array<number>';
                case '_text':
                case '_uuid':
                    return 'Array<string>';
                default:
                    throw new TypeError(`do not know how to convert type [${udtName}]`);
            }
        });
    }
}
exports.Database = Database;
