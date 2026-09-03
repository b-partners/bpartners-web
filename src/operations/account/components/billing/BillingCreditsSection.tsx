import { useToggle } from '@/common/hooks';
import { CREDIT_BALANCE_QUERY_KEY, useGetCreditBalance, useGetCreditPacks } from '@/operations/account/queries';
import { CREDIT_PURCHASE_ID_PARAM, CREDIT_PURCHASE_STATUS_PARAM, getCreditPurchase, submitCreditPurchase } from '@/providers';
import { CreditPack, CreditPurchase, CreditPurchaseStatus, CreditPurchaseType, UserSubscription } from '@bpartners/typescript-client';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useEffect, useRef, useState } from 'react';
import { useNotify } from 'react-admin';
import { useSearchParams } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { BillingSection } from './BillingSection';
import { CreditBalanceDonut } from './CreditBalanceDonut';
import { CreditPackCard } from './CreditPackCard';
import { CreditPurchaseCandidate, CreditPurchaseConfirmDialog } from './CreditPurchaseConfirmDialog';
import { DetectionTrackingHistory } from './DetectionTrackingHistory';
import { formatCredits, formatDate, hasActivePlan } from './utils';

const POLL_INTERVAL_MS = 3000;

const MAX_POLL_COUNT = 40;

const CREDITS_SECTION_ID = 'billing-credits-section';

const FOCUS_SCROLL_DELAY_MS = 300;

const isPurchaseSettled = (purchase?: CreditPurchase) => !!purchase && purchase.status !== CreditPurchaseStatus.PENDING;

interface BillingCreditsSectionProps {
  subscription?: UserSubscription;
  onRedirect: (redirectionUrl: string, title: string) => void;
  focusPacks?: boolean;
  onCompleted?: () => void;
}

export const BillingCreditsSection: FC<BillingCreditsSectionProps> = ({ subscription, onRedirect, focusPacks = false, onCompleted }) => {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const { value: arePacksOpen, toggleValue: togglePacks } = useToggle(focusPacks);
  const [candidate, setCandidate] = useState<CreditPurchaseCandidate>();
  const [searchParams, setSearchParams] = useSearchParams();
  const pollCount = useRef(0);
  const { balance, isBalanceLoading, isBalanceError } = useGetCreditBalance();
  const { packs, isPacksLoading, isPacksError } = useGetCreditPacks(arePacksOpen);

  const trackedPurchaseId = searchParams.get(CREDIT_PURCHASE_ID_PARAM);
  const trackedStatus = searchParams.get(CREDIT_PURCHASE_STATUS_PARAM);
  const isTrackingPurchase = !!trackedPurchaseId && trackedStatus === 'done';

  const clearTrackedPurchase = () => {
    const params = new URLSearchParams(searchParams);
    params.delete(CREDIT_PURCHASE_ID_PARAM);
    params.delete(CREDIT_PURCHASE_STATUS_PARAM);
    setSearchParams(params, { replace: true });
  };

  const onPurchaseCompleted = (purchase: CreditPurchase) => {
    notify(`Paiement effectué, ${formatCredits(purchase.credits)} crédits ont été ajoutés à votre solde. Votre facture vous sera envoyée par mail.`, {
      type: 'success',
    });
    queryClient.invalidateQueries({ queryKey: CREDIT_BALANCE_QUERY_KEY });
    onCompleted?.();
  };

  const { data: trackedPurchase } = useQuery({
    queryKey: ['CreditPurchaseQuery', trackedPurchaseId],
    queryFn: () => {
      pollCount.current += 1;
      return getCreditPurchase(trackedPurchaseId as string);
    },
    enabled: isTrackingPurchase,
    refetchInterval: ({ state }) => (isPurchaseSettled(state.data) || pollCount.current >= MAX_POLL_COUNT ? false : POLL_INTERVAL_MS),
  });

  const { isPending: isPurchasePending, mutate: purchase } = useMutation({
    mutationKey: ['credits', 'purchase'],
    mutationFn: submitCreditPurchase,
    onSuccess: submittedPurchase => {
      setCandidate(undefined);
      const redirectionUrl = submittedPurchase.redirection?.redirectionUrl;
      if (redirectionUrl) {
        onRedirect(redirectionUrl, 'Vous allez être redirigé vers Stripe pour finaliser votre achat de crédits');
        return;
      }
      if (submittedPurchase.status === CreditPurchaseStatus.COMPLETED) {
        onPurchaseCompleted(submittedPurchase);
        return;
      }
      notify('Votre achat est en cours de traitement, vos crédits seront ajoutés dès la confirmation du paiement.', { type: 'info' });
    },
    onError: (error: any) => notify(error?.response?.data?.message || error?.message || 'messages.global.error', { type: 'error' }),
  });

  useEffect(() => {
    if (!trackedPurchaseId) return;
    if (trackedStatus === 'error') {
      notify('Votre paiement n’a pas été finalisé, aucun crédit n’a été ajouté.', { type: 'warning' });
      clearTrackedPurchase();
      return;
    }
    if (!isPurchaseSettled(trackedPurchase)) return;
    if (trackedPurchase?.status === CreditPurchaseStatus.COMPLETED) onPurchaseCompleted(trackedPurchase);
    else notify('Votre achat de crédits n’a pas abouti, aucun crédit n’a été ajouté.', { type: 'error' });
    clearTrackedPurchase();
  }, [trackedPurchaseId, trackedStatus, trackedPurchase]);

  useEffect(() => {
    if (!focusPacks) return;
    const timer = setTimeout(() => document.getElementById(CREDITS_SECTION_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), FOCUS_SCROLL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [focusPacks]);

  const onSelectPack = (pack: CreditPack, credits: number) => setCandidate({ purchaseId: uuid(), pack, credits });

  const onConfirmPurchase = () => {
    if (!candidate) return;
    const { purchaseId, pack, credits } = candidate;
    const type = pack.creditPurchaseType ?? CreditPurchaseType.PACK;
    purchase({ purchaseId, type, credits, creditPackIdentifier: pack.id, quantity: 1 });
  };

  const getGrantRenewalNote = () => {
    if (!hasActivePlan(subscription)) return 'Les crédits inclus nécessitent un abonnement actif.';
    if (!balance?.nextGrantDatetime) return 'Vos crédits inclus sont renouvelés à chaque période de facturation.';
    return `Vos crédits inclus sont renouvelés le ${formatDate(balance.nextGrantDatetime)} et ne sont jamais reportés.`;
  };

  const nextExpiration = balance?.expirations?.[0];

  return (
    <BillingSection
      id={CREDITS_SECTION_ID}
      icon={<BoltRoundedIcon />}
      title="Crédits d'analyses"
      subtitle='Votre solde de crédits et vos achats de crédits supplémentaires.'
    >
      {isBalanceLoading ? (
        <Box className='billing-state'>
          <CircularProgress size={18} />
          Chargement de votre solde de crédits…
        </Box>
      ) : isBalanceError ? (
        <Typography className='billing-state'>Impossible de charger votre solde de crédits pour le moment.</Typography>
      ) : (
        <Box className='billing-credits-overview'>
          <CreditBalanceDonut balance={balance} />
          <Box className='billing-credits-details'>
            <Box className='billing-credit-line'>
              <Box component='span' className='billing-credit-dot billing-credit-dot--granted' />
              <Typography component='span' className='billing-credit-line-label'>
                Crédits inclus
              </Typography>
              <Typography component='span' className='billing-credit-line-value'>
                {formatCredits(balance?.grantedCredits)}
              </Typography>
            </Box>
            <Box className='billing-credit-line'>
              <Box component='span' className='billing-credit-dot billing-credit-dot--purchased' />
              <Typography component='span' className='billing-credit-line-label'>
                Crédits achetés
              </Typography>
              <Typography component='span' className='billing-credit-line-value'>
                {formatCredits(balance?.purchasedCredits)}
              </Typography>
            </Box>
            {!!balance?.creditCostPerAnalysis && (
              <Typography className='billing-credit-note'>
                <strong>{`≈ ${formatCredits(balance?.estimatedRemainingAnalyses)} analyses`}</strong>
                {` restantes · ${formatCredits(balance.creditCostPerAnalysis)} crédits par analyse.`}
              </Typography>
            )}
            <Typography className='billing-credit-note'>{getGrantRenewalNote()}</Typography>
            {!!nextExpiration?.credits && (
              <Typography className='billing-credit-note'>
                {`${formatCredits(nextExpiration.credits)} crédits expirent le ${formatDate(nextExpiration.expirationDatetime)}.`}
              </Typography>
            )}
          </Box>
        </Box>
      )}

      <Box className='billing-packs-toggle'>
        <Box className='billing-row-main'>
          <Typography className='billing-value'>Besoin de crédits supplémentaires ?</Typography>
          <Typography className='billing-hint'>Les crédits achetés ne sont jamais remis à zéro au renouvellement de votre abonnement.</Typography>
        </Box>
        <Button
          variant='outlined'
          className='billing-action billing-action--outline'
          name='billing-toggle-credit-packs'
          startIcon={<AddShoppingCartRoundedIcon fontSize='small' />}
          onClick={togglePacks}
        >
          {arePacksOpen ? 'Masquer les offres' : 'Acheter des crédits'}
        </Button>
      </Box>

      {arePacksOpen &&
        (isPacksLoading ? (
          <Box className='billing-state'>
            <CircularProgress size={18} />
            Chargement des offres de crédits…
          </Box>
        ) : isPacksError ? (
          <Typography className='billing-state'>Impossible de charger les offres de crédits pour le moment.</Typography>
        ) : (
          <Box className='billing-packs'>
            {packs.map((pack, index) => (
              <CreditPackCard key={pack.id ?? index} pack={pack} disabled={isPurchasePending} onSelect={onSelectPack} />
            ))}
          </Box>
        ))}

      <DetectionTrackingHistory />

      <CreditPurchaseConfirmDialog purchase={candidate} isPending={isPurchasePending} onCancel={() => setCandidate(undefined)} onConfirm={onConfirmPurchase} />
    </BillingSection>
  );
};
