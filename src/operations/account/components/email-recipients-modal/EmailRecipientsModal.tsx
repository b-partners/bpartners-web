import { useDialog } from '@/common/store/dialog';
import { useConfigureEmailRecipients, useGetEmailRecipients } from '@/operations/account/queries/email-recipients-query';
import { EmailRecipientType } from '@bpartners/typescript-client';
import { MarkEmailReadOutlined } from '@mui/icons-material';
import { Box, Button, Chip, CircularProgress, TextField, Typography } from '@mui/material';
import { FC, KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { useNotify } from 'react-admin';
import { RECIPIENT_META, RECIPIENT_TYPES } from './constants';
import { EmailRecipientsModalStyle } from './style';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RecipientsState = Record<EmailRecipientType, string[]>;

const EMPTY_STATE: RecipientsState = { INVOICE: [], API_NOTIFICATION: [], ACCOUNT_INFO: [] };

interface EmailRecipientRowProps {
  type: EmailRecipientType;
  emails: string[];
  onAdd: (type: EmailRecipientType, email: string) => boolean;
  onRemove: (type: EmailRecipientType, email: string) => void;
}

const EmailRecipientRow: FC<EmailRecipientRowProps> = ({ type, emails, onAdd, onRemove }) => {
  const { icon, label, description } = RECIPIENT_META[type];
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    const email = value.trim();
    if (!email) return;
    if (!EMAIL_REGEX.test(email)) {
      setError('Adresse email invalide');
      return;
    }
    if (!onAdd(type, email)) {
      setError('Cette adresse est déjà présente');
      return;
    }
    setValue('');
    setError('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    submit();
  };

  return (
    <Box className='recipient-row'>
      <Box className='recipient-head'>
        <Box className='recipient-icon'>{icon}</Box>
        <Box className='recipient-text'>
          <Typography className='recipient-label'>{label}</Typography>
          <Typography className='recipient-desc'>{description}</Typography>
        </Box>
      </Box>
      {emails.length > 0 ? (
        <Box className='recipient-chips'>
          {emails.map(email => (
            <Chip key={email} className='recipient-chip' label={email} onDelete={() => onRemove(type, email)} />
          ))}
        </Box>
      ) : (
        <Typography className='recipient-empty'>Aucun destinataire configuré.</Typography>
      )}
      <Box className='recipient-input-row'>
        <TextField
          className='recipient-input'
          size='small'
          variant='outlined'
          placeholder='ajouter une adresse email'
          value={value}
          error={!!error}
          helperText={error}
          onChange={event => {
            setValue(event.target.value);
            setError('');
          }}
          onKeyDown={handleKeyDown}
          data-cy={`email-recipient-input-${type}`}
        />
        <Button className='recipient-add-btn' variant='outlined' color='primary' onClick={submit}>
          Ajouter
        </Button>
      </Box>
    </Box>
  );
};

export const EmailRecipientsModal = () => {
  const { close } = useDialog();
  const notify = useNotify();
  const { emailRecipients, isEmailRecipientsLoading, isEmailRecipientsError } = useGetEmailRecipients();
  const { configureEmailRecipients, isConfigureEmailRecipients } = useConfigureEmailRecipients();
  const [recipients, setRecipients] = useState<RecipientsState>(EMPTY_STATE);

  const initialRecipients = useMemo(
    () =>
      (emailRecipients?.recipients || []).reduce<RecipientsState>((acc, { type, emails }) => (type ? { ...acc, [type]: emails || [] } : acc), {
        ...EMPTY_STATE,
      }),
    [emailRecipients]
  );

  useEffect(() => {
    setRecipients(initialRecipients);
  }, [initialRecipients]);

  const addEmail = (type: EmailRecipientType, email: string) => {
    if (recipients[type].includes(email)) return false;
    setRecipients(prev => ({ ...prev, [type]: [...prev[type], email] }));
    return true;
  };

  const removeEmail = (type: EmailRecipientType, email: string) => {
    setRecipients(prev => ({ ...prev, [type]: prev[type].filter(current => current !== email) }));
  };

  const handleSave = async () => {
    try {
      await configureEmailRecipients({ recipients: RECIPIENT_TYPES.map(type => ({ type, emails: recipients[type] })) });
      notify('Emails de réception mis à jour', { type: 'success' });
      close();
    } catch {
      notify("Impossible d'enregistrer les emails de réception", { type: 'error' });
    }
  };

  return (
    <Box sx={EmailRecipientsModalStyle}>
      <Box className='dialog-header'>
        <Box className='dialog-header-icon'>
          <MarkEmailReadOutlined />
        </Box>
        <Box>
          <Typography className='dialog-title'>Emails de réception</Typography>
          <Typography className='dialog-subtitle'>Définissez les adresses qui recevront chaque catégorie d'emails.</Typography>
        </Box>
      </Box>

      {isEmailRecipientsLoading && (
        <Box className='dialog-state'>
          <CircularProgress color='inherit' size={28} />
        </Box>
      )}

      {!isEmailRecipientsLoading && isEmailRecipientsError && (
        <Box className='dialog-state'>
          <Typography>Impossible de charger les emails de réception.</Typography>
        </Box>
      )}

      {!isEmailRecipientsLoading && !isEmailRecipientsError && (
        <Box className='dialog-groups'>
          {RECIPIENT_TYPES.map(type => (
            <EmailRecipientRow key={type} type={type} emails={recipients[type]} onAdd={addEmail} onRemove={removeEmail} />
          ))}
        </Box>
      )}

      <Box className='dialog-footer'>
        <Button className='footer-btn' variant='text' color='inherit' onClick={close} disabled={isConfigureEmailRecipients}>
          Annuler
        </Button>
        <Button
          className='footer-btn'
          variant='contained'
          color='primary'
          onClick={handleSave}
          disabled={isEmailRecipientsLoading || isEmailRecipientsError || isConfigureEmailRecipients}
          startIcon={isConfigureEmailRecipients && <CircularProgress color='inherit' size={18} />}
          data-cy='email-recipients-save'
        >
          Enregistrer
        </Button>
      </Box>
    </Box>
  );
};
