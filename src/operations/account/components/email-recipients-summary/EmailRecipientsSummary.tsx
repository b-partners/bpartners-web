import { useGetEmailRecipients } from '@/operations/account/queries/email-recipients-query';
import { EmailRecipientType } from '@bpartners/typescript-client';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useMemo } from 'react';
import { RECIPIENT_META, RECIPIENT_TYPES } from '../email-recipients-modal/constants';
import { EmailRecipientsSummaryStyle } from './style';

export const EmailRecipientsSummary = () => {
  const { emailRecipients, isEmailRecipientsLoading, isEmailRecipientsError } = useGetEmailRecipients();

  const emailsByType = useMemo(
    () =>
      (emailRecipients?.recipients || []).reduce<Record<EmailRecipientType, string[]>>(
        (acc, { type, emails }) => (type ? { ...acc, [type]: emails || [] } : acc),
        {} as Record<EmailRecipientType, string[]>
      ),
    [emailRecipients]
  );

  if (isEmailRecipientsLoading) return <CircularProgress size={16} />;

  if (isEmailRecipientsError) return <Typography>Non renseigné</Typography>;

  return (
    <Box sx={EmailRecipientsSummaryStyle}>
      {RECIPIENT_TYPES.map(type => {
        const emails = emailsByType[type] || [];
        return (
          <Box className='summary-row' key={type}>
            <Typography className='summary-type'>{RECIPIENT_META[type].label}</Typography>
            {emails.length > 0 ? (
              <Typography className='summary-emails'>{emails.join(', ')}</Typography>
            ) : (
              <Typography className='summary-empty'>Non renseigné</Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
