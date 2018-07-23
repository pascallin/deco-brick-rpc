"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("../../");
const log = console.log;
const discovery = new _1.EtcdDiscovery({
    namespace: "deco",
    url: "localhost:2379",
});
const { host, port } = discovery.discover("test");
log(host, port);
const rpc = new _1.GrpcClient({
    host,
    port,
    protoPath: __dirname + "/../test.proto",
});
rpc.client.Test.check().sendMessage({ data: "you" }).then((data) => {
    log(data);
}).catch((e) => {
    log(e.message);
});
