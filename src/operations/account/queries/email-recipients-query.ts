import { configureEmailRecipients, getEmailRecipients } from '@/providers';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetEmailRecipients = () => {
  const { data, isPending, isError } = useQuery({ queryKey: ['emailRecipients'], queryFn: getEmailRecipients });

  return {
    emailRecipients: data,
    isEmailRecipientsLoading: isPending,
    isEmailRecipientsError: isError,
  };
};

export const useConfigureEmailRecipients = () => {
  const queryClient = useQueryClient();
  const { isPending, mutateAsync } = useMutation({
    mutationKey: ['emailRecipients'],
    mutationFn: configureEmailRecipients,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['emailRecipients'] }),
  });

  return {
    isConfigureEmailRecipients: isPending,
    configureEmailRecipients: mutateAsync,
  };
};
