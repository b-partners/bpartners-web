import { BPLoader, FreeTrialSubscriptionModal, SubscriptionModal, SubscriptionSuccessModal } from '@/common/components';
import { useLoadingHandler } from '@/common/hooks';
import { useDialog } from '@/common/store/dialog';
import { printError } from '@/common/utils';
import { whoami } from '@/providers';
import { UserSubscriptionStatus } from '@bpartners/typescript-client';
import { FC, PropsWithChildren, useLayoutEffect } from 'react';
import { useRedirect } from 'react-admin';
import { useSearchParams } from 'react-router-dom';

export const UserSubscriptionCheckWrapper: FC<PropsWithChildren> = ({ children }) => {
  const { open: openDialog } = useDialog();
  const [searchParams] = useSearchParams();
  const { isLoading, stopLoading } = useLoadingHandler(true);
  const redirect = useRedirect();

  useLayoutEffect(() => {
    async function checkSubscription() {
      try {
        const currentWhoami = await whoami();
        switch (currentWhoami?.user?.subscription?.status) {
          case UserSubscriptionStatus.EMPTY:
            redirect('/');
            openDialog(<SubscriptionModal />, undefined, false);
            break;
          case UserSubscriptionStatus.FREE_TRIAL:
            openDialog(<FreeTrialSubscriptionModal />, undefined, true);
            break;
          default:
            break;
        }
        if (searchParams.get('stripeStatus') === 'done') {
          openDialog(<SubscriptionSuccessModal />, {}, false);
        }
      } catch (error) {
        printError(error);
      } finally {
        stopLoading();
      }
    }

    checkSubscription();
  }, [isLoading]);

  return isLoading ? <BPLoader message="Chargement des données d' authentification" /> : children;
};
