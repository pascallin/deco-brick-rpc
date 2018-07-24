export interface IDiscovery {
  url: string;
  namespace: string;
  register(name: string, uri: string): void;
  unregister(name: string, uri: string): void;
  discover(name: string): {[key: string]: any};
  watch(name: string, call: (data: {[key: string]: any}) => void): void;
}

export interface IDiscoveryConfig {
  url: string;
  namespace: string;
}
