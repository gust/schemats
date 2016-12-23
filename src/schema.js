"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const PgPromise = require('pg-promise');
const lodash_1 = require('lodash');
const pgp = PgPromise();
class Database {
    constructor(connectionString) {
        this.db = pgp(connectionString);
    }
    getEnumTypes(schema) {
        return __awaiter(this, void 0, void 0, function* () {
            let enums = {};
            yield this.db.each(`SELECT t.typname, e.enumlabel
                FROM pg_enum e
                JOIN pg_type t ON e.enumtypid = t.oid
                WHERE typcategory='E' AND
                t.typnamespace =
                    (SELECT oid FROM pg_namespace WHERE nspname = $1);`, schema, enumItem => {
                if (!enums[enumItem.typname]) {
                    enums[enumItem.typname] = [];
                }
                enums[enumItem.typname].push(enumItem.enumlabel);
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
                case 'bpchar':
                    return { category: 'base type', type: 'string' };
                case 'int2':
                case 'int4':
                case 'int8':
                case 'float8':
                case 'numeric':
                    return { category: 'base type', type: 'number' };
                case 'bool':
                    return { category: 'base type', type: 'boolean' };
                case 'json':
                case 'jsonb':
                    return { category: 'base type', type: 'Object' };
                case 'date':
                case 'timestamp':
                case 'timestamptz':
                    return { category: 'base type', type: 'Date' };
                case '_int2':
                case '_int4':
                case '_int8':
                case '_float8':
                case '_numeric':
                    return { category: 'base type', type: 'Array<number>' };
                case '_varchar':
                case '_text':
                case '_uuid':
                    return { category: 'base type', type: 'Array<string>' };
                default:
                    return { category: 'custom type', type: udtName };
            }
        });
    }
}
exports.Database = Database;
