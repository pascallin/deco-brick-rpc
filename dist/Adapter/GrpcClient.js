"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { loadPackageDefinition } from "@grpc/grpc-js";
const protoLoader = require("@grpc/proto-loader");
const grpc = require("grpc");
// tslint:disable-next-line:no-var-requires
const grpcPromise = require("grpc-promise");
const log_1 = __importDefault(require("../utils/log"));
class GrpcClient {
    constructor(config) {
        this.client = {};
        this.packageName = "";
        this.protoPath = config.protoPath;
        this.loadProto();
        if (config.discovery) {
            this.discovery = config.discovery;
            this.discoveryReload();
            const self = this;
            /**
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
        }
        else {
            if (!config.host || !config.port) {
                throw new Error("Missing config parameters: discovery | host,port ");
            }
            this.connect(config.host, config.port);
        }
    }
    connect(host, port) {
        this.host = host;
        this.port = port;
        this.loadServices();
    }
    rpc() {
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
        this.loadPackageName();
    }
    discoveryReload() {
        if (this.discovery) {
            const { host, port } = this.discovery.discover(this.packageName);
            this.connect(host, port);
        }
    }
    loadPackageName() {
        for (const i in this.protos) {
            if (this.protos[i]) {
                this.packageName = i;
            }
        }
    }
    loadServices() {
        // clean client
        for (const i in this.client) {
            if (this.client[i]) {
                this.client[i].close();
                delete this.client[i];
            }
        }
        for (const i in this.protos) {
            if (this.protos[i]) {
                for (const serviceName in this.protos[i]) {
                    if (this.protos[i][serviceName]) {
                        const client = new this.protos[i][serviceName](`${this.host}:${this.port}`, grpc.credentials.createInsecure());
                        grpcPromise.promisifyAll(client);
                        this.client[serviceName] = client;
                    }
                }
                log_1.default("BrickGrpcClient").blue(`Loaded grpc client ${this.packageName}`);
            }
        }
    }
}
exports.GrpcClient = GrpcClient;
