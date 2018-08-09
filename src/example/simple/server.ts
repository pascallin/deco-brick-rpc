import { GrpcServer, IBrickService } from "../..";

class TestService implements IBrickService {
  public name: string =  "Test";
  public async check(params: any): Promise<object> {
    return { status: "success" };
  }
}

const test = new GrpcServer({
  port: 50051,
  protoPath: __dirname + "/../protos/test.proto",
});
test.setServices([ TestService ]);
test.start();
