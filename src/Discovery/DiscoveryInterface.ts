export interface IDiscovery {
  url: string;
  namespace: string;
  register(name: string, uri: string): void;
  unregister(name: string, uri: string): void;
  discover(name: string): {[key: string]: any};
}

export interface IDiscoveryConfig {
  url: string;
  namespace: string;
}
