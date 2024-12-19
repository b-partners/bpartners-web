import { Configuration } from "@bpartners/typescript-client";
import { authProvider } from "./auth-provider";

export const configureApi = <T extends { new(conf: Configuration): InstanceType<T> }>(ApiClass: T): () => InstanceType<T> => {
  return () => new ApiClass(authProvider.getCachedAuthConf());
};
