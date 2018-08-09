import protoLoader = require("@grpc/proto-loader");
// import EventEmitter from "events";
import grpc = require("grpc");
import { IDiscovery } from "../Discovery/DiscoveryInterface";
import log from "../utils/log";

export interface IBrickRpcServerConfig {
  host?: string;
  port: number;
  protoPath: string;
  discovery?: IDiscovery;
}

export class GrpcServer {
  protected Services: any[] = [];
  protected server: any = new grpc.Server();
  private packageName: string = "";
  private host: string = "0.0.0.0";
  private port: number;
  private protoPath: string;
  private protos: any;
  private discovery?: IDiscovery;

  constructor(config: IBrickRpcServerConfig) {
    if (config.host) {
      this.host = config.host;
    }
    if (config.discovery) {
      this.discovery = config.discovery;
    }
    this.port = config.port;
    this.protoPath = config.protoPath;
  }

  public setServices(services: any[]) {
    this.Services = services;
  }

  public start() {
    this.loadProto();
    this.loadServices();
    this.listen();
  }

  private loadProto() {
    const packageDefinition = protoLoader.loadSync(this.protoPath, {
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
    if (this.Services.length === 0) {
      throw(new Error("no services !"));
    }
    for (const Service of this.Services) {
      this.loadService(Service);
    }
  }

  private loadService(Service: any) {
    const service = new Service();
    for (const i in this.protos) {
      if (this.protos[i]) {
        this.packageName = i;
        const services = this.protos[i];
        if (!services[service.name]) {
          log("BrickGrpcServer").red(`proto file does not exist service: ${service.name}`);
        }
        if (services[service.name]) {
          const methods = services[service.name].service;
          const serviceObj: {[key: string]: any} = {};
          for (const method in methods) {
            if (method) {
              serviceObj[method] = this.wrapService(service[method]);
            }
          }
          log("BrickGrpcServer").blue(`loaded service: ${service.name}`);
          this.server.addService(methods, serviceObj);
        }
      }
    }
  }

  private wrapService(fn: (params: any) => Promise<any>) {
    return (call: any, callback: any) => {
      const result = fn(call.request).then((data: any) => {
        callback(null, data);
      }).catch((e: any) => {
        callback(e);
      });
    };
  }

  private listen() {
    this.server.bind(`${this.host}:${this.port}`, grpc.ServerCredentials.createInsecure());
    if (this.discovery) {
      this.discovery.register(this.packageName, `${this.host}:${this.port}`);
    }
    this.server.start();
    log("BrickGrpcServer").blue(`listening ${this.port}`);
  }
}
