import { IDiscovery } from "../Discovery/DiscoveryInterface";
export default class ServerConatiner {
    readonly protoDirPath: string;
    readonly discovery: IDiscovery;
    clients: {};
    GrpcClient: any;
}
