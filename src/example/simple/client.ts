import { EtcdDiscovery, GrpcClient } from "../..";
const log = console.log;

const rpc = new GrpcClient({
  host: "localhost",
  port: 50051,
  protoPath: __dirname + "/../test.proto",
});

log("package name: ", rpc.packageName);

rpc.client.Test.check().sendMessage({data: "you"}).then((data: any) => {
  log(data);
}).catch((e: any) => {
  log(e.message);
});
