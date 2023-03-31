export enum EDelayPenaltyValidator {
  DELAY_PENALTY_PERCENT,
  DELAY_IN_PAYMENT_ALLOWED,
}

export const validateDPPercent = (value: string, invoice: any) => {
  const delayInPaymentAllowed = invoice.delayInPaymentAllowed || '';

  if (delayInPaymentAllowed.length > 0 && (value === null || value.length === 0)) {
    return 'Ce champ est requis';
  }
  return true;
};

export const validateDIPAllowed = (value: string, invoice: any) => {
  const delayPenaltyPercent = invoice.delayPenaltyPercent || '';
  if (delayPenaltyPercent.length > 0 && (value === null || value.length === 0)) {
    return 'Ce champ est requis';
  }
  return true;
};
