# deco-brick-ms
A simple、quick-start rpc micro-service framework

## Concept
Only `grpc` is avaliable now.

There are `GrpcServer`，`GrpcClient`，`IBrickService`，`EtcdDiscovery`  for useage.

## GrpcServer
### server config 
```
{
  host: HOST
  port: PORT,
  protoPath: PROTOPATH,
  discovery: // optional, a EtcdDiscovery class object
}
```
### server usage

#### protobuf file example as below:
```
syntax = "proto3";
package test;
service Test {
	rpc check (req) returns (res) {}
}
message req {
	string data = 1;
}
message res {
	string status = 1;
}
```
#### Create a server
**typescript** code: 
```
import { GrpcServer, IBrickService } from "deco-brick-rpc";

class TestService implements IBrickService {
  public name: string =  "Test";
  public async check(params: any): Promise<object> {
    return { status: "success" };
  }
}

const test = new GrpcServer({
  port: 50051,
  protoPath: __dirname + "/test.proto",
});
test.setServices([ TestService ]);
test.start();
```

**javascript** code:
```
const brick = require('deco-brick-rpc')
class TestService {
  constructor() {
    this.name = 'Test'
  }
  async check(params) {
    return { status: "success" };
  }
}
const app = new brick.GrpcServer({
    port: 50051,
    protoPath: __dirname + "/test.proto",
})
app.setServices([ TestService ])
app.start()
```

## GrpcClient
Client share the same protobuf file as server.

### client config
```
{
  protoPath: PROTOPATH,
  host: HOST, // optional when using discovery
  port: PORT, // optional when using discovery
  discovery: // optional, a EtcdDiscovery class object
}
```
### client usage
Here is a client demo
**typescript** code:
```
import { GrpcClient } from "deco-brick-rpc";
const log = console.log;

const rpc = new GrpcClient({
  port: 50051,
  protoPath: __dirname + "/test.proto",
});

log("package name: ", rpc.packageName);

rpc.client.Test.check().sendMessage({data: "you"}).then((data: any) => {
  log(data);
}).catch((e: any) => {
  log(e.message);
});
```
**javascript** code:
```
const brick = require('deco-brick-rpc')
const log = console.log;

const rpc = new brick.GrpcClient({
  port: 50051,
  protoPath: __dirname + "/test.proto",
});

log("package name: ", rpc.packageName);

rpc.client.Test.check().sendMessage({data: "you"}).then((data: any) => {
  log(data);
}).catch((e: any) => {
  log(e.message);
});
```
## IBrickService
The service interface is for standardization for typescript.
```
interface IBrickService {
  name: string;
}
```

## EtcdDiscovery
You can use etcd as a discovery centre for multiple application.

### discovery config
```
{
  namespace: NAMESPACE,
  url: ETCD_URL // e.g. "localhost:2379"
}
```

### server usage
**typescript** code:
```
import { EtcdDiscovery, GrpcServer, IBrickService } from "deco-brick-rpc";

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
```

### client usage
**typescript** code:
```
import { EtcdDiscovery, GrpcClient } from "deco-brick-rpc";
const log = console.log;

const rpc = new GrpcClient({
  discovery: new EtcdDiscovery({
    namespace: "deco",
    url: "localhost:2379",
  }),
  protoPath: __dirname + "/../test.proto",
});

rpc.client.Test.check().sendMessage({data: "you"}).then((data: any) => {
  log(data);
}).catch((e: any) => {
  log(e.message);
});

```

# examples
- [simple](https://github.com/pascallin/deco-brick-rpc/tree/dev/src/example/simple)
- [multiple with etcd](https://github.com/pascallin/deco-brick-rpc/tree/dev/src/example/multiple)

# TODO
- etcd watch
- thrift support