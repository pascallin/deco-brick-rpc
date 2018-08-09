"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
const log = console.log;
const rpc = new __1.GrpcClient({
    host: "localhost",
    port: 50051,
    protoPath: __dirname + "/../protos/test.proto",
});
log("package name: ", rpc.packageName);
rpc.client.Test.check().sendMessage({ data: "you" }).then((data) => {
    log(data);
}).catch((e) => {
    log(e.message);
});
