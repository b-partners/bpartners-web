export type BpDataProviderType = {
  getList: (page: number, perPage: number, filter: any) => Promise<Array<any>>;
  getOne: (id?: string, option?: any) => Promise<any>;
  saveOrUpdate: (resources: Array<any>, option?: any) => Promise<Array<any>>;
  updateOne?: (resources: any) => Promise<any>;
  update?: (resources: Array<any>) => Promise<Array<any>>;
  archive?: (resources: Array<any>) => Promise<Array<any>>;
  oauth2Init?: (options?: any) => Promise<any>;
  oauth2ExchangeToken?: (code: string, options?: any) => Promise<any>;
};
