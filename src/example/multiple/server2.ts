import { EtcdDiscovery, GrpcServer, IBrickService } from "../../";

class TestService implements IBrickService {
  public name: string =  "Test";
  public async check(params: any): Promise<object> {
    return { status: "server 2 success" };
  }
}

const test = new GrpcServer({
  discovery: new EtcdDiscovery({
    namespace: "deco",
    url: "localhost:2379",
  }),
  port: 50052,
  protoPath: __dirname + "/../test.proto",
});
test.setServices([ TestService ]);
test.start();
