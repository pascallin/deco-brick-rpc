import { IDiscovery, IDiscoveryConfig } from "./DiscoveryInterface";
export declare class EtcdDiscovery implements IDiscovery {
    readonly namespace: string;
    readonly url: string;
    private readonly etcd;
    constructor(config: IDiscoveryConfig);
    register(name: string, uri: string): void;
    unregister(name: string, uri: string): void;
    discover(name: string): {
        [key: string]: any;
    };
    watch(name: string, call: (data: {
        [key: string]: any;
    }) => void): void;
    protected pickHost(hosts: string[]): string;
    private getPath(name);
    private onExit(name, uri);
}
