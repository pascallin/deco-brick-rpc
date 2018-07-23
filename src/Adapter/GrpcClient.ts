import protoLoader = require("@grpc/proto-loader");
import grpc = require("grpc");
// tslint:disable-next-line:no-var-requires
const grpcPromise = require("grpc-promise");

import log from "../utils/log";

export interface IBrickRpcClientConfig {
  protoPath: string;
  host?: string;
  port: number;
}

export class GrpcClient {
  public client: {[key: string]: any} = {};
  public packageName: string = "";
  private host?: string = "localhost";
  private port: number;
  private protoPath: string;
  private protos: any;

  constructor(config: IBrickRpcClientConfig) {
    this.protoPath = config.protoPath;
    if (config.host) {
      this.host = config.host;
    }
    this.port = config.port;
    this.loadProto();
    this.loadServices();
  }

  public rpc(method: string): any {
    return this.client;
  }

  private loadProto() {
    const packageDefinition = protoLoader.loadSync(
    this.protoPath,
    {
      defaults: true,
      enums: String,
      keepCase: true,
      longs: String,
      oneofs: true,
    });
    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
    this.protos = protoDescriptor;
  }

  private loadServices() {
    for (const i in this.protos) {
      if (this.protos[i]) {
        this.packageName = i;
        for (const serviceName in this.protos[i]) {
          if (this.protos[i][serviceName]) {
            const client = new this.protos[i][serviceName](
              `${this.host}:${this.port}`, grpc.credentials.createInsecure());
            grpcPromise.promisifyAll(client);
            this.client[serviceName] = client;
            log("BrickGrpcClient").blue(`Loaded grpc client ${this.packageName}`);
          }
        }
      }
    }
  }
}
