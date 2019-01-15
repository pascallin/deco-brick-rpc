"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const protoLoader = require("@grpc/proto-loader");
// import EventEmitter from "events";
const grpc = require("grpc");
const log_1 = __importDefault(require("../utils/log"));
class GrpcServer {
    constructor(config) {
        this.Services = [];
        this.server = new grpc.Server();
        this.packageName = "";
        this.host = "0.0.0.0";
        if (config.host) {
            this.host = config.host;
        }
        if (config.discovery) {
            this.discovery = config.discovery;
        }
        this.port = config.port;
        this.protoPath = config.protoPath;
    }
    setServices(services) {
        this.Services = services;
    }
    start() {
        this.loadProto();
        this.loadServices();
        this.listen();
    }
    loadProto() {
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
    loadServices() {
        if (this.Services.length === 0) {
            throw (new Error("no services !"));
        }
        for (const Service of this.Services) {
            this.loadService(Service);
        }
    }
    loadService(Service) {
        const service = new Service();
        for (const i in this.protos) {
            if (this.protos[i]) {
                this.packageName = i;
                const services = this.protos[i];
                if (!services[service.name]) {
                    log_1.default("BrickGrpcServer").red(`proto file does not exist service: ${service.name}`);
                }
                if (services[service.name]) {
                    const methods = services[service.name].service;
                    const serviceObj = {};
                    for (const method in methods) {
                        if (method) {
                            serviceObj[method] = this.wrapService(service[method]);
                        }
                    }
                    log_1.default("BrickGrpcServer").blue(`loaded service: ${service.name}`);
                    this.server.addService(methods, serviceObj);
                }
            }
        }
    }
    wrapService(fn) {
        return (call, callback) => {
            const result = fn(call.request).then((data) => {
                callback(null, data);
            }).catch((e) => {
                // tslint:disable-next-line:no-console
                console.error(e.stack);
                callback(e);
            });
        };
    }
    listen() {
        const result = this.server.bind(`${this.host}:${this.port}`, grpc.ServerCredentials.createInsecure());
        if (result === 0) {
            throw new Error("Failed to bind port");
        }
        if (this.discovery) {
            this.discovery.register(this.packageName, `${this.host}:${this.port}`);
        }
        this.server.start();
        log_1.default("BrickGrpcServer").blue(`listening ${this.port}`);
    }
}
exports.GrpcServer = GrpcServer;
