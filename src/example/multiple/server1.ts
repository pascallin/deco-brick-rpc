import { EtcdDiscovery, GrpcServer, IBrickService } from "../../";

class TestService implements IBrickService {
  public name: string =  "Test";
  public async check(params: any): Promise<object> {
    return { status: "server 1 success" };
  }
}

const test = new GrpcServer({
  discovery: new EtcdDiscovery({
    namespace: "deco",
    url: "localhost:2379",
  }),
  port: 50051,
  protoPath: __dirname + "/../test.proto",
});
test.setServices([ TestService ]);
test.start();
