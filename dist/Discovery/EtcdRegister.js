"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const log_1 = __importDefault(require("../utils/log"));
// tslint:disable-next-line:no-var-requires
const Etcd = require("node-etcd");
class EtcdRegister {
    constructor(config) {
        this.url = config.url;
        this.namespace = config.namespace;
        this.etcd = new Etcd(this.url);
    }
    register(name, uri) {
        const etcdPath = this.getPath(name);
        this.etcd.set(etcdPath, JSON.stringify({ name, uri }), (err) => {
            if (err) {
                log_1.default("EtcdDiscovery").red(err.message);
            }
            log_1.default("EtcdDiscovery").blue(`${name} registered`);
        });
        process.on("beforeExit", () => {
            this.unregister(name);
        });
        process.on("exit", (code) => {
            log_1.default("Process").red(`Exit with code: ${code}`);
        });
        process.on("SIGINT", () => {
            this.unregister(name);
            process.exit(1);
        });
    }
    unregister(name) {
        log_1.default("EtcdDiscovery").red(`${name} unregistered`);
        this.etcd.delSync(this.getPath(name));
    }
    getPath(name) {
        this.etcd.mkdirSync(this.namespace);
        return `${this.namespace}/${name}`;
    }
}
exports.EtcdRegister = EtcdRegister;
