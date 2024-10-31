import { FC, ReactNode } from 'react';
import { Invoice } from '@bpartners/typescript-client';
import { Card, CardContent, CardHeader, IconButton, Tooltip } from '@mui/material';
import { Clear } from '@mui/icons-material';
import { UrlParams } from '@/common/utils';
import { PdfViewer } from '@/common/components';
import { useInvoiceToolContext } from '@/common/store/invoice';
import { PDF_WIDTH } from './utils/utils';

export type CancelButtonProps = {
  onClose?: () => void;
}

export type ContextCancelButtonProps = {
  clearUrlParams?: boolean;
}

export type InvoicePdfDocumentProps = {
  selectedInvoice: Invoice;
  onClose?: () => void;
  url?: string;
  children: ReactNode;
}

export const CancelButton: FC<CancelButtonProps> = ({ onClose }) => {
  return (
    <Tooltip title='Retourner à la liste'>
      <IconButton onClick={onClose}>
        <Clear />
      </IconButton>
    </Tooltip>
  );
};

export const ContextCancelButton: FC<ContextCancelButtonProps> = ({ clearUrlParams = false }) => {
  const { setView } = useInvoiceToolContext();
  const handleOnClose = () => {
    setView('list');
    clearUrlParams && UrlParams.clear();
  };
  return <CancelButton onClose={handleOnClose} />;
};

const InvoicePdfDocument: FC<InvoicePdfDocumentProps> = ({ selectedInvoice, onClose, url, children = null }) => {
  return (
    <Card sx={{ border: 'none' }}>
      <CardHeader
        action={onClose ? <CancelButton onClose={onClose} /> : <ContextCancelButton />}
        title={selectedInvoice.title}
        subheader={selectedInvoice.ref}
      />
      <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        {children}
        <PdfViewer width={PDF_WIDTH} url={url} filename={selectedInvoice.ref} />
      </CardContent>
    </Card>
  );
};

export default InvoicePdfDocument;
