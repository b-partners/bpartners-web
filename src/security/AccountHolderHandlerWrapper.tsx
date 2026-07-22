import { BPLoader, UpdateBusinessModal } from '@/common/components';
import { hasSiren, useSirenRequirement } from '@/common/hooks';
import { useDialog } from '@/common/store/dialog';
import { accountHolderProvider, authProvider } from '@/providers';
import { AccountHolder } from '@bpartners/typescript-client';
import { useQuery } from '@tanstack/react-query';
import { AxiosError, isAxiosError } from 'axios';
import { FC, PropsWithChildren, useEffect } from 'react';

const isAuthError = (error: AxiosError) => error?.status === 401 || error?.status === 403;
const hasBusinessActivities = (accountHolder: AccountHolder) => !!(accountHolder?.businessActivities?.primary || accountHolder?.businessActivities?.secondary);
export const AccountHolderHandlerWrapper: FC<PropsWithChildren> = ({ children }) => {
  const { open } = useDialog();
  const { openSirenModal } = useSirenRequirement();
  const isSubscribed = authProvider.isSubscribed();
  const { isLoading, data: accountHolder } = useQuery<AccountHolder>({
    retry: 5,
    queryKey: ['accountHolder'],
    queryFn: async () => {
      try {
        return isSubscribed ? await accountHolderProvider.getOne() : null;
      } catch (error) {
        if (isAxiosError(error) && isAuthError(error)) {
          return null;
        }
        throw error;
      }
    },
  });

  /* The hasBusinessActivities guard in the following implies that when accountHolder is not loaded yet,
   then the Prospects page will not be displayed */
  const hasBusinessActivity = hasBusinessActivities(accountHolder);

  useEffect(() => {
    if (isLoading || !accountHolder) return;
    if (!hasBusinessActivity) {
      open(<UpdateBusinessModal />, undefined, false);
    } else if (!hasSiren(accountHolder)) {
      openSirenModal();
    }
  }, [isLoading]);

  return isLoading ? <BPLoader message='Chargement des données de votre compte...' /> : children;
};
