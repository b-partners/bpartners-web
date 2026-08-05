import { BPLoader, PaymentMethodRequiredModal, SubscriptionBillingModal, SubscriptionModal, SubscriptionSuccessModal } from '@/common/components';
import { useLoadingHandler } from '@/common/hooks';
import { useDialog } from '@/common/store/dialog';
import { printError } from '@/common/utils';
import { getBackWhoami } from '@/providers';
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
        const currentWhoami = await getBackWhoami();
        switch (currentWhoami?.user?.subscription?.status) {
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
          case UserSubscriptionStatus.EMPTY:
            openDialog(<SubscriptionModal />, { maxWidth: 'lg', fullWidth: true }, false);
            break;
          case UserSubscriptionStatus.FREE_TRIAL:
            openDialog(<SubscriptionModal />, { maxWidth: 'lg', fullWidth: true }, true);
            break;
          default:
            break;
        }
        if (searchParams.get('stripeStatus') === 'done') {
          openDialog(
            <SubscriptionSuccessModal
              title='Inscription terminée'
              description='Votre abonnement a été effectué avec succès, et votre inscription est dorénavant terminée.'
            />,
            {},
            false
          );
        } else if (searchParams.get('stripePaymentStatus') === 'done') {
          openDialog(
            <SubscriptionSuccessModal
              title='Moyen de paiement ajouté'
              description="Votre carte a été ajoutée avec succès. Vous avez dorénavant accès aux fonctionnalités de l'application."
            />,
            {},
            false
          );
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
