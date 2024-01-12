import { Card } from '@mui/material';
import InvoicePdfDocument from '../invoice/InvoicePdfDocument';
import TransactionSupportingDoc from '../invoice/TransactionSupportingDoc';
import { getReceiptUrl } from '../invoice/utils';
import { useEffect, useState } from 'react';

const TransactionReceiptView = ({ selectedDoc, onClose }) => {
  const [fileExtension, setFileExtension] = useState('');
  const [url, setUrl] = useState('');
  const acceptedFileExtensions = ['png', 'jpeg', 'jpg'];

  const returnCorrectUrl = () => {
    const invoiceUrl = getReceiptUrl(selectedDoc.fileId, 'INVOICE');
    const supportingDocsUrl = getReceiptUrl(selectedDoc.id, 'TRANSACTION_SUPPORTING_DOCS');
    return selectedDoc.fileId ? invoiceUrl : supportingDocsUrl;
  };

  const returnFileExtension = async () => {
    const correctUrl = returnCorrectUrl();
    setUrl(correctUrl);
    return fetch(correctUrl).then(res => {
      // get the file extension
      const contentType = res.headers.get('Content-Type');
      return contentType ? contentType.split('/')[1] : '';
    });
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
        <TransactionSupportingDoc selectedDoc={selectedDoc} onClose={onClose} url={url} />
      ) : (
        <p style={{ textAlign: 'center' }}>Chargement du document...</p>
      )}
    </Card>
  );
};

export default TransactionReceiptView;
