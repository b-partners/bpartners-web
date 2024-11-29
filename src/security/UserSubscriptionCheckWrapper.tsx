import { BPLoader, SubscriptionModal, SubscriptionSuccessModal } from '@/common/components';
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
    (async function () {
      try {
        const currentWhoami = await whoami();
        if (currentWhoami?.user?.subscription?.status === UserSubscriptionStatus.EMPTY) {
          redirect('/');
          openDialog(<SubscriptionModal />, undefined, false);
        }
        if (searchParams.get('stripeStatus') === 'done') {
          openDialog(<SubscriptionSuccessModal />);
        }
      } catch (error) {
        printError(error);
      } finally {
        stopLoading();
      }
    })();
  }, [isLoading]);

  return isLoading ? <BPLoader message="Chargement des données d' authentification" /> : children;
};
