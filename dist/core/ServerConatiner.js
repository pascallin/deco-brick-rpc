"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ServerConatiner {
    constructor(config) {
        this.protoPathArr = [];
        this.servers = [];
        this.protoPath = config.protoPath;
        this.type = config.type;
        this.host = config.host;
        this.port = config.port;
        switch (this.type) {
            case "grpc":
                this.protoSuffix = "proto";
                break;
            default:
                this.protoSuffix = "proto";
                break;
        }
        this.loadProtoPathArr(this.protoPath);
    }
    loadProtoPathArr(protoPath) {
        const files = fs_1.default.readdirSync(protoPath);
        for (const file of files) {
            const fileStat = fs_1.default.statSync(path_1.default.join(protoPath, file));
            if (fileStat.isFile() && file.indexOf(`.${this.protoSuffix}`) > -1) {
                this.protoPathArr.push(protoPath + file);
            }
        }
    }
}
exports.default = ServerConatiner;
