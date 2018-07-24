import { EtcdDiscovery, GrpcClient } from "../../";
const log = console.log;
import koa from "koa";

const rpc = new GrpcClient({
  discovery: new EtcdDiscovery({
    namespace: "deco",
    url: "localhost:2379",
  }),
  protoPath: __dirname + "/../test.proto",
});

const app = new koa();

app.use(async (ctx: any) => {
    ctx.body = await rpc.rpc().Test.check().sendMessage({data: "you"});
});

app.listen(3000);
