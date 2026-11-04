import { AnalysisProject } from '@bpartners/typescript-client';
import { useGetOne } from 'react-admin';

export const useAnalysisProject = (projectKey?: string) =>
  useGetOne<AnalysisProject & { id: string }>('analysis-projects', { id: projectKey }, { enabled: !!projectKey });
