"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const protoLoader = require("@grpc/proto-loader");
const grpc = require("grpc");
// tslint:disable-next-line:no-var-requires
const grpcPromise = require("grpc-promise");
const log_1 = __importDefault(require("../utils/log"));
class GrpcClient {
    constructor(config) {
        this.client = {};
        this.packageName = "";
        this.host = "localhost";
        this.protoPath = config.protoPath;
        if (config.host) {
            this.host = config.host;
        }
        this.port = config.port;
        this.loadProto();
        this.loadServices();
    }
    rpc(method) {
        return this.client;
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
        for (const i in this.protos) {
            if (this.protos[i]) {
                this.packageName = i;
                for (const serviceName in this.protos[i]) {
                    if (this.protos[i][serviceName]) {
                        const client = new this.protos[i][serviceName](`${this.host}:${this.port}`, grpc.credentials.createInsecure());
                        grpcPromise.promisifyAll(client);
                        this.client[serviceName] = client;
                        log_1.default("BrickGrpcClient").blue(`Loaded grpc client ${this.packageName}`);
                    }
                }
            }
        }
    }
}
exports.GrpcClient = GrpcClient;
