import { updateFeedbackLink } from '@/providers';
import { useMutation } from '@tanstack/react-query';

export const useUpdateFeedbackLink = () => {
    const { isPending, mutate } = useMutation({ mutationKey: ['FeedbackLink'], mutationFn: updateFeedbackLink });

    return {
        isUpdateFeedbackLink: isPending,
        updateFeedbackLink: mutate,
    };
};
