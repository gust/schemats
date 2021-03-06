import * as PgPromise from 'pg-promise'
import { mapValues } from 'lodash'
const pgp = PgPromise()

export class Database {
    private db

    constructor(connectionString: string) {
        this.db = pgp(connectionString)
    }

    public async getEnumTypes(schema: string) {
        let enums = {}
        await this.db.each(
            `SELECT t.typname, e.enumlabel
                FROM pg_enum e
                JOIN pg_type t ON e.enumtypid = t.oid
                WHERE typcategory='E' AND
                t.typnamespace =
                    (SELECT oid FROM pg_namespace WHERE nspname = $1);`,
            schema, enumItem => {
                if (!enums[enumItem.typname]) {
                    enums[enumItem.typname] = []
                }
                enums[enumItem.typname].push(enumItem.enumlabel)
            }
        )
        return enums
    }

    public async getDBSchema(tableName: string, schemaName: string) {
        let schema = {}
        await this.db.each(
            `SELECT column_name, udt_name
             FROM information_schema.columns
             WHERE table_name = $1 AND table_schema = $2`,
            [tableName, schemaName], schemaItem => {
                schema[schemaItem.column_name] = schemaItem.udt_name
            })
        return schema
    }

    public async getTableTypes(tableName: string, schema: string) {
        return this.mapDBSchemaToType(await this.getDBSchema(tableName, schema))
    }

    private mapDBSchemaToType(schema: Object) {
        return mapValues(schema, udtName => {
            switch (udtName) {
                case 'varchar':
                case 'text':
                case 'uuid':
                case 'inet':
                case 'bpchar':
                    return { category: 'base type', type: 'string' }
                case 'int2':
                case 'int4':
                case 'int8':
                case 'float8':
                case 'numeric':
                    return { category: 'base type', type: 'number' }
                case 'bool':
                    return { category: 'base type', type: 'boolean' }
                case 'json':
                case 'jsonb':
                    return { category: 'base type', type: 'Object' }
                case 'date':
                case 'timestamp':
                case 'timestamptz':
                    return { category: 'base type', type: 'Date' }
                case '_int2':
                case '_int4':
                case '_int8':
                case '_float8':
                case '_numeric':
                    return { category: 'base type', type: 'Array<number>' }
                case '_varchar':
                case '_text':
                case '_uuid':
                    return { category: 'base type', type: 'Array<string>' }
                default:
                    return { category: 'custom type', type: udtName }
            }
        })
    }
}
