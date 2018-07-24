import { EtcdDiscovery, GrpcClient } from "../../";
const log = console.log;

const discovery = new EtcdDiscovery({
  namespace: "deco",
  url: "localhost:2379",
});
const { host, port } = discovery.discover("test");
log(host, port);
const rpc = new GrpcClient({
  host,
  port,
  protoPath: __dirname + "/..",
});
rpc.client.Test.check().sendMessage({data: "you"}).then((data: any) => {
  log(data);
}).catch((e: any) => {
  log(e.message);
});
