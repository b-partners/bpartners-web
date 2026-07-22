import { updateFeedbackLink } from '@/providers';
import { useMutation } from '@tanstack/react-query';

export const useUpdateFeedbackLink = () => {
  const { isPending, mutateAsync } = useMutation({ mutationKey: ['FeedbackLink'], mutationFn: updateFeedbackLink });

  return {
    isUpdateFeedbackLink: isPending,
    updateFeedbackLink: mutateAsync,
  };
};
