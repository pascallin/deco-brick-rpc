"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const GrpcClient_1 = require("../Adapter/GrpcClient");
class ClientConatiner {
    constructor(config) {
        this.clients = {};
        this.protoDirPath = config.protoDirPath;
        this.discovery = config.discovery;
        this.loadClients();
    }
    loadClients() {
        const files = fs_1.default.readdirSync(this.protoDirPath);
        for (const file of files) {
            const fileStat = fs_1.default.statSync(path_1.default.join(this.protoDirPath, file));
            if (fileStat.isFile() && file.indexOf(`.proto`) > -1) {
                const rpc = new GrpcClient_1.GrpcClient({
                    discovery: this.discovery,
                    protoPath: path_1.default.join(this.protoDirPath, file),
                });
                this.clients[rpc.packageName] = rpc.client;
            }
        }
    }
}
exports.ClientConatiner = ClientConatiner;
