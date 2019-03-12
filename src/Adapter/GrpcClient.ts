import protoLoader = require("@grpc/proto-loader");

import grpc = require("grpc");
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
    if (config.discovery) {

      this.discovery = config.discovery;
    }
    if (!config.discovery && (!config.host || !config.port)) {
        throw new Error("Missing config parameters: discovery | host,port ");
      }
    this.host = config.host;
    this.port = config.port;

    this.run().then(() => {
      log("BrickGrpcClient").green(`grpc client is running`);
    }).catch(log("BrickGrpcClient").error);
  }

  public connect(host: string, port: number) {
    this.host = host;
    this.port = port;
    this.run();
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
  }

  private loadPackageName() {
    for (const i in this.protos) {
      if (this.protos[i]) {
        this.packageName = i;
      }
    }
  }

  private loadServices(host: string, port: number) {
    for (const i in this.protos) {
      if (this.protos[i]) {
        for (const serviceName in this.protos[i]) {
          if (this.protos[i][serviceName]) {
            const client = new this.protos[i][serviceName](
              `${host}:${port}`, grpc.credentials.createInsecure());
            grpcPromise.promisifyAll(client);
            this.client[serviceName] = client;
          }
        }
        log("BrickGrpcClient").blue(`Loaded grpc client: ${this.packageName}`);
      }
    }
  }

  private async closeAllServiceClient(): Promise<any> {
    for (const i in this.protos) {
      if (this.protos[i]) {
        for (const serviceName in this.protos[i]) {
          if (this.protos[i][serviceName]) {
            if (this.client[serviceName]) {
              grpc.closeClient(this.client[serviceName]);
              // this.client[serviceName].close();
            }
          }
        }
      }
    }
  }

  private discoveryReload(): void {
    if (this.discovery) {
      // close connected client
      // this.closeAllServiceClient();
      const { host, port } = this.discovery.discover(this.packageName);
      if (port > 0) {
        this.closeAllServiceClient().then(() => {
          this.loadServices(host, port);
        });
      }
    }
  }

  private async run() {
    log("BrickGrpcClient").yellow(`start running...`);
    this.loadProto();
    this.loadPackageName();
    if (this.discovery) {
      this.discoveryReload();
      /**
       * TODO:
       * When connected rpc server is down and ready to switch,
       * There is a BUG here.
       * Assertion failed:
       *  (handle->type == UV_TCP || handle->type == UV_TTY || handle->type == UV_NAMED_PIPE),
       *  function uv___stream_fd, file ../deps/uv/src/unix/stream.c, line 1620.
       * Abort trap: 6
       */
      this.discovery.watch(this.packageName, () => {
        log("BrickGrpcClient").yellow(`Discovery reload service ${this.packageName}`);
        this.discoveryReload();
      });
    } else {
      if (this.host && this.port) {
        this.loadServices(this.host, this.port);
      }
    }
  }
}
