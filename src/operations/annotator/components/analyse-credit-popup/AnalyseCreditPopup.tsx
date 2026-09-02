import { useAnalyseCreditPopupStore } from '@/common/store';
import { formatCredits } from '@/operations/account/components/billing/utils';
import { useGetCreditBalance } from '@/operations/account/queries';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Box, IconButton, Typography } from '@mui/material';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { AnalyseCreditPopupStyle, CREDIT_POPUP_VISIBLE_MS } from './style';

const CLOSING_DURATION_MS = 300;

interface AnalyseCreditPopupProps {
  resultDisplayed: boolean;
}

export const AnalyseCreditPopup: FC<AnalyseCreditPopupProps> = ({ resultDisplayed }) => {
  const { armed, visible, credits, show, hide } = useAnalyseCreditPopupStore();
  const { refetchBalance } = useGetCreditBalance(false);
  const [isClosing, setIsClosing] = useState(false);
  const hasTriggered = useRef(false);

  const startClosing = useCallback(() => setIsClosing(true), []);

  useEffect(() => {
    if (!armed || !resultDisplayed || hasTriggered.current) return;
    hasTriggered.current = true;
    refetchBalance().then(({ data }) => show(data?.spendableCredits));
  }, [armed, resultDisplayed, refetchBalance, show]);

  useEffect(() => {
    if (!resultDisplayed) hasTriggered.current = false;
  }, [resultDisplayed]);

  useEffect(() => {
    if (!visible) return;
    setIsClosing(false);
    const closeTimer = setTimeout(startClosing, CREDIT_POPUP_VISIBLE_MS);
    return () => clearTimeout(closeTimer);
  }, [visible, startClosing]);

  useEffect(() => {
    if (!isClosing) return;
    const hideTimer = setTimeout(hide, CLOSING_DURATION_MS);
    return () => clearTimeout(hideTimer);
  }, [isClosing, hide]);

  if (!visible) return null;

  return (
    <Box sx={AnalyseCreditPopupStyle} className={isClosing ? 'is-closing' : ''} data-testid='analyse-credit-popup'>
      <Box className='credit-popup-icon'>
        <BoltRoundedIcon />
      </Box>
      <Typography className='credit-popup-message'>
        <Box component='span' className='credit-popup-value'>
          {formatCredits(credits)}
        </Box>
        {" crédits d'analyses restants."}
      </Typography>
      <IconButton className='credit-popup-close' onClick={startClosing} aria-label='fermer' size='small'>
        <CloseRoundedIcon fontSize='small' />
      </IconButton>
      {!isClosing && <Box className='credit-popup-progress' />}
    </Box>
  );
};
