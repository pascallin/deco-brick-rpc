import { IDiscovery } from "../Discovery/DiscoveryInterface";
export interface IBrickRpcServerConfig {
    host?: string;
    port: number;
    protoPath: string;
    discovery?: IDiscovery;
}
export declare class GrpcServer {
    protected Services: any[];
    protected server: any;
    private packageName;
    private host;
    private port;
    private protoPath;
    private protos;
    private discovery?;
    constructor(config: IBrickRpcServerConfig);
    setServices(services: any[]): void;
    start(): void;
    private loadProto();
    private loadServices();
    private loadService(Service);
    private wrapService(fn);
    private listen();
}
