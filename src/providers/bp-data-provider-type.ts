export type BpDataProviderType = {
  getList: (page: number, perPage: number, filter: any) => Promise<Array<any>>;
  getOne: (id?: string) => Promise<any>;
  saveOrUpdate: (resources: Array<any>, option?: any) => Promise<Array<any>>;
  updateOne?: (resources: any) => Promise<any>;
  update?: (resources: Array<any>) => Promise<Array<any>>;
  archive?: (resources: Array<any>) => Promise<Array<any>>;
};
