// import { loadPackageDefinition } from "@grpc/grpc-js";
import protoLoader = require("@grpc/proto-loader");

import grpc = require("grpc");
// tslint:disable-next-line:no-var-requires
const grpcPromise = require("grpc-promise");
import { IDiscovery } from "../Discovery/DiscoveryInterface";
import log from "../utils/log";

export interface IBrickRpcClientConfig {
  protoPath: string;
  host?: string;
  port?: number;
  discovery?: IDiscovery;
}

export class GrpcClient {
  public client: {[key: string]: any} = {};
  public packageName: string = "";
  public host?: string;
  public port?: number;
  private readonly protoPath: string;
  private protos: any;
  private discovery?: IDiscovery;

  constructor(config: IBrickRpcClientConfig) {
    this.protoPath = config.protoPath;
    this.loadProto();
    if (config.discovery) {
      this.discovery = config.discovery;
      this.discoveryReload();
      const self = this;
      /**
       * TODO:
       * There is a BUG here.
       * Assertion failed:
       *  (handle->type == UV_TCP || handle->type == UV_TTY || handle->type == UV_NAMED_PIPE),
       *  function uv___stream_fd, file ../deps/uv/src/unix/stream.c, line 1620.
       * Abort trap: 6
       */
      // this.discovery.watch(this.packageName, (data: {[key: string]: any}) => {
      //   log("BrickGrpcClient").yellow(`Discovery reload service ${self.packageName}`);
      //   self.discoveryReload.apply(self);
      // });
    } else {
      if (!config.host || !config.port) {
        throw new Error("Missing config parameters: discovery | host,port ");
      }
      this.connect(config.host, config.port);
    }
  }

  public connect(host: string, port: number) {
    this.host = host;
    this.port = port;
    this.loadServices();
  }

  public rpc(): any {
    return this.client;
  }

  public loadProto() {
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
    this.loadPackageName();
  }

  public discoveryReload(): void {
    if (this.discovery) {
      const { host, port } = this.discovery.discover(this.packageName);
      this.connect(host, port);
    }
  }

  private loadPackageName() {
    for (const i in this.protos) {
      if (this.protos[i]) {
        this.packageName = i;
      }
    }
  }

  private loadServices() {
    // TODO: clean client for discovery
    // for (const i in this.client) {
    //   if (this.client[i]) {
    //     this.client[i].close();
    //     delete this.client[i];
    //   }
    // }
    for (const i in this.protos) {
      if (this.protos[i]) {
        for (const serviceName in this.protos[i]) {
          if (this.protos[i][serviceName]) {
            const client = new this.protos[i][serviceName](
              `${this.host}:${this.port}`, grpc.credentials.createInsecure());
            grpcPromise.promisifyAll(client);
            this.client[serviceName] = client;
          }
        }
        log("BrickGrpcClient").blue(`Loaded grpc client: ${this.packageName}`);
      }
    }
  }
}
