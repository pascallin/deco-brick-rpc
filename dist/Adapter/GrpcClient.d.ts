import { IDiscovery } from "../Discovery/DiscoveryInterface";
export interface IBrickRpcClientConfig {
    protoPath: string;
    host?: string;
    port?: number;
    discovery?: IDiscovery;
}
export declare class GrpcClient {
    client: {
        [key: string]: any;
    };
    packageName: string;
    host?: string;
    port?: number;
    private readonly protoPath;
    private protos;
    private discovery?;
    constructor(config: IBrickRpcClientConfig);
    connect(host: string, port: number): void;
    rpc(): any;
    loadProto(): void;
    private loadPackageName;
    private loadServices;
    private closeAllServiceClient;
    private discoveryReload;
    private run;
}
