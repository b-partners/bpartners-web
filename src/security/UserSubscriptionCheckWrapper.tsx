import { BPLoader, PaymentMethodRequiredModal, SubscriptionBillingModal, SubscriptionModal } from '@/common/components';
import { useLoadingHandler } from '@/common/hooks';
import { useDialog } from '@/common/store/dialog';
import { printError } from '@/common/utils';
import { hasSpendableCredits, isSubscriptionExpired } from '@/operations/account/components/billing/utils';
import { getBackWhoami, getCreditBalance } from '@/providers';
import { UserSubscriptionStatus } from '@bpartners/typescript-client';
import { FC, PropsWithChildren, useLayoutEffect } from 'react';
import { useRedirect } from 'react-admin';

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
        switch (subscriptionStatus) {
          case UserSubscriptionStatus.PAYMENT_METHOD_REQUIRED:
            redirect('/');
            openDialog(<PaymentMethodRequiredModal />, undefined, false);
            break;
          case UserSubscriptionStatus.UNPAID:
            redirect('/');
            openDialog(
              <SubscriptionBillingModal
                button='Procéder au paiement'
                title='Factures impayées'
                description='Il vous reste des factures impayées.'
                additionalDescription='Pour continuer à utiliser l’application, veuillez régulariser votre situation.'
              />,
              undefined,
              false
            );
            break;
          case UserSubscriptionStatus.EMPTY: {
            const balance = await getCreditBalance().catch(() => undefined);
            if (hasSpendableCredits(balance)) break;
            redirect('/');
            openDialog(<SubscriptionModal />, { maxWidth: 'lg', fullWidth: true }, false);
            break;
          }
          case UserSubscriptionStatus.FREE_TRIAL:
            openDialog(<SubscriptionModal />, { maxWidth: 'lg', fullWidth: true }, true);
            break;
          default:
            break;
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
