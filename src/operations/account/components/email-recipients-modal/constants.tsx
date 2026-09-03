import { EmailRecipientType } from '@bpartners/typescript-client';
import { AccountCircleOutlined, ApiOutlined, ReceiptLongOutlined } from '@mui/icons-material';
import { ReactNode } from 'react';

export const RECIPIENT_TYPES = [EmailRecipientType.INVOICE, EmailRecipientType.API_NOTIFICATION, EmailRecipientType.ACCOUNT_INFO];

export const RECIPIENT_META: Record<EmailRecipientType, { icon: ReactNode; label: string; description: string }> = {
  INVOICE: { icon: <ReceiptLongOutlined />, label: 'Factures et devis', description: 'Emails liés à vos factures, devis et relances.' },
  API_NOTIFICATION: { icon: <ApiOutlined />, label: 'Notifications API', description: 'Notifications techniques émises par le service.' },
  ACCOUNT_INFO: { icon: <AccountCircleOutlined />, label: 'Informations du compte', description: 'Emails concernant votre compte et votre abonnement.' },
};
