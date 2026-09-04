import { BPLoader, SubscriptionModal } from '@/common/components';
import { useLoadingHandler } from '@/common/hooks';
import { useDialog } from '@/common/store/dialog';
import { printError } from '@/common/utils';
import { isSubscriptionExpired } from '@/operations/account/components/billing/utils';
import { getBackWhoami, getDefaultPaymentMethod } from '@/providers';
import { UserSubscriptionStatus } from '@bpartners/typescript-client';
import { FC, PropsWithChildren, useLayoutEffect } from 'react';
import { useRedirect } from 'react-admin';

const hasRegisteredCard = async () => {
  const paymentMethod = await getDefaultPaymentMethod().catch(() => null);
  return !!paymentMethod?.card?.lastFourDigits;
};

export const UserSubscriptionCheckWrapper: FC<PropsWithChildren> = ({ children }) => {
  const { open: openDialog } = useDialog();
  const { isLoading, stopLoading } = useLoadingHandler(true);
  const redirect = useRedirect();

  useLayoutEffect(() => {
    async function checkSubscription() {
      try {
        const currentWhoami = await getBackWhoami();
        const subscription = currentWhoami?.user?.subscription;
        const subscriptionStatus = isSubscriptionExpired(subscription) ? UserSubscriptionStatus.EMPTY : subscription?.status;
        const isActive = subscriptionStatus === UserSubscriptionStatus.ACTIVE;
        if (isActive || !subscriptionStatus || (await hasRegisteredCard())) return;
        redirect('/');
        openDialog(<SubscriptionModal />, { maxWidth: 'lg', fullWidth: true }, false);
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
