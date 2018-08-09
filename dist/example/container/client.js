"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("../../");
const log = console.log;
const discovery = new _1.EtcdDiscovery({
    namespace: "deco",
    url: "localhost:2379",
});
const rpc = new _1.ClientConatiner({
    discovery,
    protoDirPath: __dirname + "/../protos",
});
// 'test' is the package name in protofile
rpc.clients.test.Test.check().sendMessage({ data: "you" }).then((data) => {
    log(data);
}).catch((e) => {
    log(e.message);
});
