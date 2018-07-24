import _ from "lodash";
import log from "../utils/log";
import { IDiscovery, IDiscoveryConfig } from "./DiscoveryInterface";

// tslint:disable-next-line:no-var-requires
const Etcd = require("node-etcd");

export class EtcdDiscovery implements IDiscovery {
  public readonly namespace: string;
  public readonly url: string;
  private readonly etcd: any;

  constructor(config: IDiscoveryConfig) {
    this.url = config.url;
    this.namespace = config.namespace;
    this.etcd = new Etcd(this.url);
  }

  public register(name: string, uri: string): void {
    const path = this.getPath(name);
    // format: { uri: [ 'host:port' ] }
    let newData = {uri: [uri]};
    // push uri to the exist service array
    const res = this.etcd.getSync(path);
    if (!res.err) {
      const oldData = JSON.parse(res.body.node.value);
      oldData.uri.push(uri);
      newData = oldData;
    }
    // set etcd key-value
    this.etcd.setSync(path, JSON.stringify(newData));
    log("EtcdDiscovery").blue(`${name} registered`);
    this.onExit(name, uri);
  }
  public unregister(name: string, uri: string): void {
    const path = this.getPath(name);
    const res = this.etcd.getSync(path);
    if (!res.err) {
      const oldData = JSON.parse(res.body.node.value);
      if (oldData.uri.length === 1) {
        this.etcd.delSync(path);
        log("EtcdDiscovery").red(`${name} unregistered`);
      } else {
        const newData = [];
        for (const i in oldData.uri) {
          if (oldData.uri[i]) {
            if (oldData.uri[i] !== uri) {
              newData.push(oldData.uri[i]);
            }
          }
        }
        this.etcd.setSync(path, JSON.stringify({uri: newData}));
        log("EtcdDiscovery").red(`${name} unregistered`);
      }
    }
  }

  public discover(name: string): {[key: string]: any} {
    const service = this.etcd.getSync(this.getPath(name));
    let data: string[] = [];
    try {
      data = JSON.parse(service.body.node.value).uri;
    } catch (e) {
      log("EtcdDiscovery").red(`${name} discovery parse data error: ${service}`);
      throw e;
    }
    const uri = this.pickHost(data);
    return { host: uri.split(":")[0], port: parseInt(uri.split(":")[1], 10) };
  }
  public watch(name: string, call: (data: {[key: string]: any}) => void): void {
    const watcher = this.etcd.watcher(this.getPath(name));
    watcher.on("change", call);
  }

  protected pickHost(hosts: string[]): string {
    return hosts[_.random(0, hosts.length - 1)];
  }
  private getPath(name: string): string {
    this.etcd.mkdirSync(this.namespace);
    return `${this.namespace}/${name}`;
  }
  private onExit(name: string, uri: string) {
    process.on("beforeExit", () => {
      this.unregister(name, uri);
    });
    process.on("exit", (code) => {
      log("Process").red(`Exit with code: ${code}`);
    });
    process.on("SIGINT", () => {
      this.unregister(name, uri);
      process.exit(1);
    });
  }
}
