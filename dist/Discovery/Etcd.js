"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const log_1 = __importDefault(require("../utils/log"));
// tslint:disable-next-line:no-var-requires
const Etcd = require("node-etcd");
class EtcdDiscovery {
    constructor(config) {
        this.url = config.url;
        this.namespace = config.namespace;
        this.etcd = new Etcd(this.url);
    }
    register(name, uri) {
        const path = this.getPath(name);
        // format: { uri: [ 'host:port' ] }
        let newData = JSON.stringify({ uri: [uri] });
        // push uri to the exist service array
        const res = this.etcd.getSync(path);
        if (!res.err) {
            const oldData = JSON.parse(res.body.node.value);
            oldData.uri.push(uri);
            newData = JSON.stringify(oldData);
        }
        // set etcd key-value
        this.etcd.setSync(path, newData);
        log_1.default("EtcdDiscovery").blue(`${name} registered`);
        this.onExit(name, uri);
    }
    unregister(name, uri) {
        const path = this.getPath(name);
        const res = this.etcd.getSync(path);
        if (!res.err) {
            const oldData = JSON.parse(res.body.node.value);
            if (oldData.uri.length === 1) {
                this.etcd.delSync(path);
                log_1.default("EtcdDiscovery").red(`${name} unregistered`);
            }
            else {
                const newData = [];
                for (const i in oldData.uri) {
                    if (oldData.uri[i]) {
                        if (oldData.uri[i] !== uri) {
                            newData.push(oldData.uri[i]);
                        }
                    }
                }
                this.etcd.setSync(path, JSON.stringify({ uri: newData }));
                log_1.default("EtcdDiscovery").red(`${name} unregistered`);
            }
        }
    }
    discover(name) {
        const service = this.etcd.getSync(this.getPath(name));
        let data = [];
        try {
            data = JSON.parse(service.body.node.value).uri;
        }
        catch (e) {
            log_1.default("EtcdDiscovery").red(`${name} discovery data error: ${service}`);
            throw e;
        }
        const uri = data[lodash_1.default.random(0, data.length - 1)];
        return { host: uri.split(":")[0], port: parseInt(uri.split(":")[1], 10) };
    }
    getPath(name) {
        this.etcd.mkdirSync(this.namespace);
        return `${this.namespace}/${name}`;
    }
    onExit(name, uri) {
        process.on("beforeExit", () => {
            this.unregister(name, uri);
        });
        process.on("exit", (code) => {
            log_1.default("Process").red(`Exit with code: ${code}`);
        });
        process.on("SIGINT", () => {
            this.unregister(name, uri);
            process.exit(1);
        });
    }
}
exports.EtcdDiscovery = EtcdDiscovery;
