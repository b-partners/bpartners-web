import { updateGlobalInformation } from '@/providers';
import { useMutation } from '@tanstack/react-query';

export const useUpdateGlobalInformationFieldsCompany = () => {
  const { isPending, mutateAsync } = useMutation({
    mutationKey: ['GlobalInformationFieldsCompany'],
    mutationFn: updateGlobalInformation,
    onError: error => console.log(error),
  });

  return {
    isUpldateGlobalInformation: isPending,
    updateGlobalInformation: mutateAsync,
  };
};
