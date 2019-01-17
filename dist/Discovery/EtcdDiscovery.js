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
        const newData = { uri: [uri] };
        // push uri to the exist service array
        const res = this.etcd.getSync(path);
        if (!res.err) {
            const oldData = JSON.parse(res.body.node.value);
            oldData.uri.push(uri);
            // unique array
            newData.uri =
                oldData.uri.reduce((prev, curr) => prev.indexOf(curr) > -1 ? prev : [...prev, curr], []);
        }
        // set etcd key-value
        this.etcd.setSync(path, JSON.stringify(newData));
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
                const newData = { uri: [] };
                newData.uri = oldData.uri.filter((v) => v !== uri);
                this.etcd.setSync(path, JSON.stringify(newData));
                log_1.default("EtcdDiscovery").red(`${name} unregistered`);
            }
        }
    }
    discover(name) {
        const service = this.etcd.getSync(this.getPath(name));
        let data = [];
        if (service.err) {
            log_1.default("EtcdDiscovery").red(`service name ${name} not found! [node-etcd package] Error: `);
            log_1.default("node-etcd package").error(service.err);
            return { host: "", port: 0 };
        }
        try {
            data = JSON.parse(service.body.node.value).uri;
        }
        catch (e) {
            log_1.default("EtcdDiscovery").red(`${name} discovery parse data error: ${service}`);
            throw e;
        }
        const uri = this.pickHost(data);
        return { host: uri.split(":")[0], port: parseInt(uri.split(":")[1], 10) };
    }
    watch(name, call) {
        const watcher = this.etcd.watcher(this.getPath(name));
        watcher.on("change", call);
    }
    pickHost(hosts) {
        // TODO: update pick up algorithm
        return hosts[lodash_1.default.random(0, hosts.length - 1)];
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
