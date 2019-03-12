"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const protoLoader = require("@grpc/proto-loader");
const grpc = require("grpc");
const grpcPromise = require("grpc-promise");
const log_1 = __importDefault(require("../utils/log"));
class GrpcClient {
    constructor(config) {
        this.client = {};
        this.packageName = "";
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
            log_1.default("BrickGrpcClient").green(`grpc client is running`);
        }).catch(log_1.default("BrickGrpcClient").error);
    }
    connect(host, port) {
        this.host = host;
        this.port = port;
        this.run();
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
    }
    loadPackageName() {
        for (const i in this.protos) {
            if (this.protos[i]) {
                this.packageName = i;
            }
        }
    }
    loadServices(host, port) {
        for (const i in this.protos) {
            if (this.protos[i]) {
                for (const serviceName in this.protos[i]) {
                    if (this.protos[i][serviceName]) {
                        const client = new this.protos[i][serviceName](`${host}:${port}`, grpc.credentials.createInsecure());
                        grpcPromise.promisifyAll(client);
                        this.client[serviceName] = client;
                    }
                }
                log_1.default("BrickGrpcClient").blue(`Loaded grpc client: ${this.packageName}`);
            }
        }
    }
    closeAllServiceClient() {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    discoveryReload() {
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
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            log_1.default("BrickGrpcClient").yellow(`start running...`);
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
                    log_1.default("BrickGrpcClient").yellow(`Discovery reload service ${this.packageName}`);
                    this.discoveryReload();
                });
            }
            else {
                if (this.host && this.port) {
                    this.loadServices(this.host, this.port);
                }
            }
        });
    }
}
exports.GrpcClient = GrpcClient;
