export interface IBrickRpcServerConfig {
    host?: string;
    port: number;
    protoPath: string;
}
export declare class GrpcServer {
    protected Services: any[];
    protected server: any;
    private host;
    private port;
    private protoPath;
    private protos;
    constructor(config: IBrickRpcServerConfig);
    setServices(services: any[]): void;
    start(): void;
    private loadProto();
    private loadServices();
    private loadService(Service);
    private wrapService(fn);
    private listen();
}
