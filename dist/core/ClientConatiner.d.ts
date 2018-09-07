import { IDiscovery } from "../Discovery/DiscoveryInterface";
export interface IClientConatinerConfig {
    discovery: IDiscovery;
    protoDirPath: string;
}
export declare class ClientConatiner {
    readonly protoDirPath: string;
    readonly discovery: IDiscovery;
    clients: {
        [key: string]: any;
    };
    constructor(config: IClientConatinerConfig);
    protected loadClients(): void;
}
