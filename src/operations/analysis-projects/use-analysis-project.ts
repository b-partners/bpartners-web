import { AnalysisProject } from '@bpartners/typescript-client';
import { useGetOne } from 'react-admin';

interface UseAnalysisProjectOptions {
  refetchInterval?: number;
}

export const useAnalysisProject = (projectKey?: string, { refetchInterval }: UseAnalysisProjectOptions = {}) =>
  useGetOne<AnalysisProject & { id: string }>('analysis-projects', { id: projectKey }, { enabled: !!projectKey, refetchInterval, retry: false });
