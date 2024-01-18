import { Card, CardHeader } from '@mui/material';
import InvoicePdfDocument, { CancelButton, ContextCancelButton } from '../invoice/InvoicePdfDocument';
import TransactionSupportingDoc from '../invoice/TransactionSupportingDoc';
import { getReceiptUrl } from '../invoice/utils';
import { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';

const TransactionReceiptView = ({ selectedDoc, onClose }) => {
  const [fileExtension, setFileExtension] = useState('');
  const [url, setUrl] = useState('');
  const acceptedFileExtensions = ['png', 'jpeg', 'jpg'];
  const notify = useNotify();

  const returnCorrectUrl = () => {
    const invoiceUrl = getReceiptUrl(selectedDoc.fileId, 'INVOICE');
    const supportingDocsUrl = getReceiptUrl(selectedDoc.id, 'TRANSACTION_SUPPORTING_DOCS');
    return selectedDoc.fileId ? invoiceUrl : supportingDocsUrl;
  };

  const returnFileExtension = async () => {
    const correctUrl = returnCorrectUrl();

    try {
      const response = await fetch(correctUrl);
      const blob = await response.blob();
      setUrl(URL.createObjectURL(blob));
      return blob ? blob.type.split('/')[1] : '';
    } catch (error) {
      notify('messages.global.error', { type: 'error' });
    }
  };

  useEffect(() => {
    const getFileExtension = async () => {
      const fileExtension = await returnFileExtension();
      setFileExtension(fileExtension);
    };
    getFileExtension();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card sx={{ border: 'none' }}>
      {fileExtension === 'pdf' ? (
        <InvoicePdfDocument selectedInvoice={selectedDoc} onClose={onClose} url={url} />
      ) : acceptedFileExtensions.includes(fileExtension) ? (
        <TransactionSupportingDoc onClose={onClose} url={url} />
      ) : (
        <>
          <CardHeader title='Justificatif' action={onClose ? <CancelButton onClose={onClose} /> : <ContextCancelButton />} />
          <p style={{ textAlign: 'center' }}>Chargement du document...</p>
        </>
      )}
    </Card>
  );
};

export default TransactionReceiptView;
