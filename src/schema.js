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
    getEnumTypes(schema) {
        return __awaiter(this, void 0, void 0, function* () {
            let enums = {};
            yield this.db.each(`select n.nspname as schema,
                 t.typname as name,
                 e.enumlabel as value
             from pg_type t
             join pg_enum e on t.oid = e.enumtypid
             join pg_catalog.pg_namespace n ON n.oid = t.typnamespace
             where enum_schema = '$1'`, schema, enumItem => {
                if (!enums[enumItem.name]) {
                    enums[enumItem.name] = [];
                }
                enums[enumItem.name].append(enumItem.value);
            });
            return enums;
        });
    }
    getDBSchema(tableName, schemaName) {
        return __awaiter(this, void 0, void 0, function* () {
            let schema = {};
            yield this.db.each(`SELECT column_name, udt_name
             FROM information_schema.columns
             WHERE table_name = $1 AND table_schema = $2`, [tableName, schemaName], schemaItem => {
                schema[schemaItem.column_name] = schemaItem.udt_name;
            });
            return schema;
        });
    }
    getTableTypes(tableName, schema) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.mapDBSchemaToType(yield this.getDBSchema(tableName, schema));
        });
    }
    mapDBSchemaToType(schema) {
        return lodash_1.mapValues(schema, udtName => {
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
                case '_int2':
                case '_int4':
                case '_int8':
                case '_float8':
                case '_numeric':
                    return 'Array<number>';
                case '_varchar':
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
