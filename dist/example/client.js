"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const log = console.log;
const rpc = new index_1.GrpcClient({
    host: "localhost",
    port: 50051,
    protoPath: __dirname + "/test.proto",
});
log("package name: ", rpc.packageName);
rpc.client.Test.check().sendMessage({ data: "you" }).then((data) => {
    log(data);
}).catch((e) => {
    log(e.message);
});
