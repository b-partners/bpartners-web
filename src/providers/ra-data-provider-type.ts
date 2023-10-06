export type RaListResponseType = {
  data: Array<any>;
  total: number;
  pageInfo?: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type RaSingleResponseType = {
  data: any;
};

export type RaDataProviderType = {
  getList: (resourceType: string, params: any) => Promise<RaListResponseType>;
  getOne: (resourceType: string, params: any) => Promise<RaSingleResponseType>;
  create: (resourceType: string, params: any) => Promise<RaSingleResponseType>;
  update: (resourceType: string, params: any) => Promise<RaSingleResponseType>;
  archive?: (resourceType: string, params: any) => Promise<RaSingleResponseType>;
  oauth2Init?: (resourceType: string, params?: any) => Promise<RaSingleResponseType>;
  oauth2ExchangeToken?: (resourceType: string, params: any) => Promise<RaSingleResponseType>;
};
