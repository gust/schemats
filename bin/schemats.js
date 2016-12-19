#! /usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const yargs = require("yargs");
const bluebird = require("bluebird");
const fsAsync = bluebird.promisifyAll(require('fs'));
const index_1 = require("../src/index");
let argv = yargs
    .usage('Usage: $0 <command> [options]')
    .command('generate', 'generate type definition')
    .demand(1)
    .example('$0 generate -c postgres://username:password@localhost/db -t table1 -t table2 -n namespace -o interface_output.ts', 'generate typescript interfaces from schema')
    .demand('c')
    .alias('c', 'conn')
    .nargs('c', 1)
    .describe('c', 'database connection string')
    .demand('t')
    .alias('t', 'table')
    .nargs('t', 1)
    .describe('t', 'table name')
    .demand('n')
    .alias('n', 'namespace')
    .nargs('n', 1)
    .describe('n', 'namespace for interfaces')
    .demand('o')
    .nargs('o', 1)
    .alias('o', 'output')
    .describe('o', 'output file name')
    .help('h')
    .alias('h', 'help')
    .argv;
(() => __awaiter(this, void 0, void 0, function* () {
    try {
        let db = new index_1.Database(argv.c);
        if (!Array.isArray(argv.t)) {
            argv.t = [argv.t];
        }
        let formattedOutput = yield index_1.typescriptOfSchema(db, argv.n, argv.t, index_1.extractCommand(process.argv, argv.c), index_1.getTime());
        yield fsAsync.writeFileAsync(argv.o, formattedOutput.dest);
    }
    catch (e) {
        console.error(e);
        process.exit(1);
    }
}))().then(() => {
    process.exit();
});
