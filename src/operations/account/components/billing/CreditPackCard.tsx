import { CreditPack, CreditPurchaseType } from '@bpartners/typescript-client';
import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { FC, useState } from 'react';
import { formatCredits, formatEuros, formatUnitEuros, getPackCredits, getPackTotalCents } from './utils';

const DEFAULT_CUSTOM_CREDITS = 1;

const MIN_CUSTOM_CREDITS = 1;

const getValidityLabel = ({ validityDays }: CreditPack) => (validityDays ? `Valables ${validityDays} jours` : 'Sans expiration');

interface CreditPackCardProps {
  pack: CreditPack;
  isPending?: boolean;
  disabled?: boolean;
  onSelect: (pack: CreditPack, credits: number) => void;
}

export const CreditPackCard: FC<CreditPackCardProps> = ({ pack, isPending = false, disabled = false, onSelect }) => {
  const [customCredits, setCustomCredits] = useState(String(DEFAULT_CUSTOM_CREDITS));
  const isCustom = pack.creditPurchaseType === CreditPurchaseType.CUSTOM;
  const parsedCredits = Number(customCredits);
  const safeCredits = Number.isFinite(parsedCredits) ? parsedCredits : 0;
  const credits = getPackCredits(pack, safeCredits, 1);
  const totalCents = getPackTotalCents(pack, safeCredits, 1);
  const isInvalid = isCustom && (!Number.isInteger(safeCredits) || safeCredits < MIN_CUSTOM_CREDITS);

  return (
    <Box className={`billing-pack${pack.isMostChosen ? ' billing-pack--featured' : ''}`}>
      {pack.isMostChosen && <Box className='billing-pack-badge'>Le plus choisi</Box>}
      <Typography className='billing-pack-credits'>{isCustom ? 'Montant libre' : `${formatCredits(pack.credits)} crédits`}</Typography>
      <Typography className='billing-pack-description'>{pack.description}</Typography>

      {isCustom && (
        <Box className='billing-pack-custom'>
          <TextField
            size='small'
            type='number'
            value={customCredits}
            className='billing-pack-custom-input'
            name={`credit-pack-custom-credits-${pack.code ?? pack.id}`}
            inputProps={{ min: MIN_CUSTOM_CREDITS, step: 1 }}
            onChange={({ target: { value } }) => setCustomCredits(value)}
          />
          <Typography className='billing-pack-custom-unit'>crédits</Typography>
        </Box>
      )}

      <Typography className='billing-pack-price'>{formatEuros(totalCents)}</Typography>
      <Typography className='billing-pack-price-hint'>{`TTC · ${formatUnitEuros(pack.creditUnitPriceInCentsWithVat)} / crédit`}</Typography>
      <Typography className='billing-pack-price-hint'>{getValidityLabel(pack)}</Typography>

      <Button
        variant='contained'
        className='billing-pack-cta'
        name={`buy-credit-pack-${pack.code ?? pack.id}`}
        disabled={disabled || isPending || isInvalid}
        startIcon={isPending ? <CircularProgress size={14} color='inherit' /> : undefined}
        onClick={() => onSelect(pack, credits)}
      >
        Acheter
      </Button>
    </Box>
  );
};
