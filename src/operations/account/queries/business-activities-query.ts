import { businessActivitiesProvider } from '@/providers';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useGetBusinessJob = () => {
  const { data = [] } = useQuery({ queryKey: ['BusinessJobQuery'], queryFn: businessActivitiesProvider.getJobList });
  return {
    jobList: data.map(({ name }) => name),
  };
};

export const useUpdateBusinessJob = () => {
  const { isPending, mutate } = useMutation({ mutationKey: ['BusinessJobMutation'], mutationFn: businessActivitiesProvider.update });

  return {
    isUpldateBusinessJobLoading: isPending,
    updateBusinessJob: mutate,
  };
};
