import { IDiscovery, IDiscoveryConfig } from "./DiscoveryInterface";
export declare class EtcdRegister implements IDiscovery {
    readonly namespace: string;
    readonly url: string;
    readonly etcd: any;
    constructor(config: IDiscoveryConfig);
    register(name: string, uri: string): void;
    unregister(name: string): void;
    private getPath(name);
}
