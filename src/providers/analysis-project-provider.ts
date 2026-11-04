import { AnalysisProject, AnalysisProjectPhase, CreateDraftAnalysisProject } from '@bpartners/typescript-client';
import { analysisProjectApi } from './api';
import { BpDataProviderType } from './bp-data-provider-type';
import { getCached } from './cache';

interface AnalysisProjectFilter {
  projectKey?: string;
  externalReference?: string;
  search?: string;
  status?: AnalysisProjectPhase;
}

const withId = (project: AnalysisProject) => ({ ...project, id: project.projectKey });

export const analysisProjectProvider: BpDataProviderType = {
  getList: async (page: number, pageSize: number, filter: AnalysisProjectFilter) => {
    const { userId } = getCached.userInfo();
    const { projectKey, externalReference, search, status } = filter;
    const { data } = await analysisProjectApi().listAnalysisProjects(userId, projectKey, externalReference, search, page, pageSize, status);
    return data.map(withId);
  },
  getOne: async (projectKey: string) => {
    const { userId } = getCached.userInfo();
    const { data } = await analysisProjectApi().getAnalysisProject(userId, projectKey);
    return withId(data);
  },
  saveOrUpdate: async ([{ id, ...draft }]: Array<CreateDraftAnalysisProject & { id: string }>) => {
    const { userId } = getCached.userInfo();
    const { data } = await analysisProjectApi().createDraftAnalysisProject(userId, id, draft);
    return [withId(data)];
  },
};
