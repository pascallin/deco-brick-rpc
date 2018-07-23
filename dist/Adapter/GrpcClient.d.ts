export interface IBrickRpcClientConfig {
    protoPath: string;
    host?: string;
    port: number;
}
export declare class GrpcClient {
    client: {
        [key: string]: any;
    };
    packageName: string;
    private host?;
    private port;
    private protoPath;
    private protos;
    constructor(config: IBrickRpcClientConfig);
    rpc(method: string): any;
    private loadProto();
    private loadServices();
}
