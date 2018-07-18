"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const protoLoader = require("@grpc/proto-loader");
const chalk_1 = __importDefault(require("chalk"));
const grpc = require("grpc");
const log = console.log;
class GrpcServer {
    constructor(config) {
        this.Services = [];
        this.server = new grpc.Server();
        this.host = "0.0.0.0";
        if (config.host) {
            this.host = config.host;
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
                const services = this.protos[i];
                if (!services[service.name]) {
                    log(chalk_1.default.red(`[BrickGrpcServer] proto file does not exist service: ${service.name}`));
                }
                if (services[service.name]) {
                    const methods = services[service.name].service;
                    const serviceObj = {};
                    for (const method in methods) {
                        if (method) {
                            serviceObj[method] = this.wrapService(service[method]);
                        }
                    }
                    log(chalk_1.default.blue(`[BrickGrpcServer] loaded service: ${service.name}`));
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
                callback(e);
            });
        };
    }
    listen() {
        this.server.bind(`${this.host}:${this.port}`, grpc.ServerCredentials.createInsecure());
        this.server.start();
    }
}
exports.GrpcServer = GrpcServer;
