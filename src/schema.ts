import * as PgPromise from 'pg-promise'
import { mapValues } from 'lodash'
const pgp = PgPromise()

export class Database {
    private db

    constructor(connectionString: string) {
        this.db = pgp(connectionString)
    }

    public async getEnumTypes(schema = 'public') {
        let enums = {}
        await this.db.each(
            `select n.nspname as schema,  
                 t.typname as name,  
                 e.enumlabel as value
             from pg_type t 
             join pg_enum e on t.oid = e.enumtypid  
             join pg_catalog.pg_namespace n ON n.oid = t.typnamespace
             where enum_schema = '$1'`,
            schema, enumItem => {
                const {name, value} = enumItem
                if (!enums[name]) {
                    enums[name] = []
                }
                enums[name].append(value)
            }
        )
        return enums
    }

    public async getDBSchema(tableName: string) {
        let schema = {}
        await this.db.each(
            `SELECT column_name, udt_name
             FROM information_schema.columns
             WHERE table_name = $1`,
            tableName, schemaItem => {
                schema[schemaItem.column_name] = schemaItem.udt_name
            })
        return schema
    }

    public async getTableTypes(tableName: string) {
        return this.mapDBSchemaToType(await this.getDBSchema(tableName))
    }

    private mapDBSchemaToType(schema: Object) {
        return mapValues(schema, udtName => {
            switch (udtName) {
                case 'varchar':
                case 'text':
                case 'uuid':
                case 'inet':
                    return 'string'
                case 'int2':
                case 'int4':
                case 'int8':
                case 'float8':
                case 'numeric':
                    return 'number'
                case 'bool':
                    return 'boolean'
                case 'json':
                case 'jsonb':
                    return 'Object'
                case 'date':
                case 'timestamp':
                case 'timestamptz':
                    return 'Date'
                case '_int2':
                case '_int4':
                case '_int8':
                case '_float8':
                case '_numeric':
                    return 'Array<number>'
                case '_varchar':
                case '_text':
                case '_uuid':
                    return 'Array<string>'
                default:
                    throw new TypeError(`do not know how to convert type [${udtName}]`)
            }
        })
    }
}
