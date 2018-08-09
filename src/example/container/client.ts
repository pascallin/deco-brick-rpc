import { ClientConatiner, EtcdDiscovery } from "../../";
const log = console.log;

const discovery = new EtcdDiscovery({
  namespace: "deco",
  url: "localhost:2379",
});
const rpc = new ClientConatiner({
  discovery,
  protoDirPath: __dirname + "/../protos",
});
// 'test' is the package name in protofile
rpc.clients.test.Test.check().sendMessage({data: "you"}).then((data: any) => {
  log(data);
}).catch((e: any) => {
  log(e.message);
});
