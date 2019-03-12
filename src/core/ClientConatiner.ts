import fs from "fs";
import path from "path";
import { GrpcClient } from "../Adapter/GrpcClient";
import { IDiscovery } from "../Discovery/DiscoveryInterface";

export interface IClientConatinerConfig {
  discovery: IDiscovery;
  protoDirPath: string;
}

export class ClientConatiner {
  public readonly protoDirPath: string;
  public readonly discovery: IDiscovery;

  public clients: { [key: string]: any } = {};

  constructor(config: IClientConatinerConfig) {
    this.protoDirPath = config.protoDirPath;
    this.discovery = config.discovery;
    this.loadClients();
  }

  protected loadClients() {
    const files = fs.readdirSync(this.protoDirPath);
    for (const file of files) {
      const fileStat = fs.statSync(path.join(this.protoDirPath, file));
      if (fileStat.isFile() && file.indexOf(`.proto`) > -1) {
        const rpc = new GrpcClient({
          discovery: this.discovery,
          protoPath: path.join(this.protoDirPath, file),
        });
        this.clients[rpc.packageName] = rpc.client;
      }
    }
  }

}
