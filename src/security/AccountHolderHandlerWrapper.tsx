import { BPLoader, UpdateBusinessModal } from '@/common/components';
import { hasSiren, useSirenRequirement } from '@/common/hooks';
import { useDialog } from '@/common/store/dialog';
import { accountHolderProvider, authProvider } from '@/providers';
import { AccountHolder } from '@bpartners/typescript-client';
import { useQuery } from '@tanstack/react-query';
import { AxiosError, isAxiosError } from 'axios';
import { FC, PropsWithChildren, useEffect, useRef } from 'react';

const isAuthError = (error: AxiosError) => error?.status === 401 || error?.status === 403;
const hasBusinessActivities = (accountHolder: AccountHolder) => !!(accountHolder?.businessActivities?.primary || accountHolder?.businessActivities?.secondary);
export const AccountHolderHandlerWrapper: FC<PropsWithChildren> = ({ children }) => {
  const { open, isOpen } = useDialog();
  const { openSirenModal } = useSirenRequirement();
  const isSubscribed = authProvider.isSubscribed();
  const hasRequirementBeenOpened = useRef(false);
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

  /* The subscription dialog opened by UserSubscriptionCheckWrapper has priority since it blocks the access
   when no payment method is registered, so the business activity requirement waits for the global dialog
   to be free before taking it over, and is only opened once to avoid reopening itself on close */
  useEffect(() => {
    if (isLoading || !accountHolder || isOpen || hasRequirementBeenOpened.current) return;
    if (!hasBusinessActivity) {
      hasRequirementBeenOpened.current = true;
      open(<UpdateBusinessModal />, undefined, false);
    } else if (!hasSiren(accountHolder)) {
      hasRequirementBeenOpened.current = true;
      openSirenModal();
    }
  }, [isLoading, isOpen]);

  return isLoading ? <BPLoader message='Chargement des données de votre compte...' /> : children;
};
