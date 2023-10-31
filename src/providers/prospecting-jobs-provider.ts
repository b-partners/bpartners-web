import { BpDataProviderType, getCached, prospectingApi } from '.';

export const prospectingJobsProvider: BpDataProviderType = {
  getList: async function (page: number, perPage: number, filters = {}): Promise<any[]> {
    const { accountHolderId } = getCached.userInfo();
    const { data } = await prospectingApi().getProspectEvaluationJobs(accountHolderId);
    return data;
  },
  getOne: async function (jId: string): Promise<any> {
    const { accountHolderId } = getCached.userInfo();
    const { data } = await prospectingApi().getProspectEvaluationJobDetailsById(accountHolderId, jId);
    return data;
  },
  saveOrUpdate: async function (resources: any[]): Promise<any[]> {
    const { accountHolderId } = getCached.userInfo();
    const { data } = await prospectingApi().runProspectEvaluationJobs(accountHolderId, resources);
    return data;
  },
};
