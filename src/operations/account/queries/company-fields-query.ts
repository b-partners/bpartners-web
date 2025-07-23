import { updateGlobalInformation } from '@/providers';
import { useMutation } from '@tanstack/react-query';

export const useUpdateGlobalInformationFieldsCompany = () => {
    const { isPending, mutate } = useMutation({ mutationKey: ['GlobalInformationFieldsCompany'], mutationFn: updateGlobalInformation });

    return {
        isUpldateBusinessJobLoading: isPending,
        updateBusinessJob: mutate,
    };
};