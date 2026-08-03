import { useToggle } from '@/common/hooks';
import {
  downloadExportBatches,
  getExportReadyBatches,
  isExportRequestEmpty,
  isExportRequestReady,
  isExportRequestSettled,
  retrieveInvoicesExportRequest,
  submitInvoicesExportRequest,
} from '@/providers';
import DownloadIcon from '@mui/icons-material/Download';
import { Button } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useNotify } from 'react-admin';
import { InvoiceExportFilters, InvoiceExportModal } from './InvoiceExportModal';

const DATE_FORMAT = 'YYYY-MM-DD';
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_COUNT = 100;

export const InvoiceExportButton = () => {
  const { value: isExportOpen, handleOpen, handleClose } = useToggle();
  const notify = useNotify();
  const [requestId, setRequestId] = useState<string | null>(null);
  const pollCount = useRef(0);

  const { isPending, mutate } = useMutation({
    mutationKey: ['invoices', 'export'],
    mutationFn: ({ from, to, statuses, archiveStatus, batchSize }: InvoiceExportFilters) =>
      submitInvoicesExportRequest({
        statuses,
        archiveStatus,
        batchSize,
        from: from?.format(DATE_FORMAT) || '',
        to: to?.format(DATE_FORMAT) || '',
      }),
    onSuccess: id => {
      pollCount.current = 0;
      setRequestId(id);
    },
    onError: (error: Error) => notify(error.message || 'messages.global.error', { type: 'error' }),
  });

  const { data: exportRequest, dataUpdatedAt } = useQuery({
    queryKey: ['invoices', 'export', requestId],
    queryFn: () => {
      pollCount.current += 1;
      return retrieveInvoicesExportRequest(requestId as string);
    },
    enabled: !!requestId,
    refetchInterval: ({ state }) => (isExportRequestSettled(state.data) || pollCount.current >= MAX_POLL_COUNT ? false : POLL_INTERVAL_MS),
  });

  const isPolling = !!requestId && !isExportRequestSettled(exportRequest);
  const totalBatchCount = exportRequest?.totalBatchCount || 0;
  const readyBatchCount = getExportReadyBatches(exportRequest).length;
  const progress = totalBatchCount > 0 && readyBatchCount > 0 ? (readyBatchCount / totalBatchCount) * 100 : undefined;

  useEffect(() => {
    if (!requestId || !exportRequest) return;

    if (isExportRequestEmpty(exportRequest)) {
      notify('Aucune facture ne correspond aux critères sélectionnés.', { type: 'warning' });
      setRequestId(null);
      return;
    }

    if (isExportRequestReady(exportRequest)) {
      downloadExportBatches(exportRequest);
      notify('Le téléchargement de vos factures a démarré.', { type: 'success' });
      setRequestId(null);
      handleClose();
      return;
    }

    if (pollCount.current >= MAX_POLL_COUNT) {
      notify('La préparation de vos factures est trop longue. Réessayez dans quelques minutes.', { type: 'error' });
      setRequestId(null);
    }
  }, [requestId, exportRequest, dataUpdatedAt]);

  return (
    <>
      <Button startIcon={<DownloadIcon />} name='open-invoice-export-modal' onClick={handleOpen}>
        Exporter mes factures
      </Button>
      <InvoiceExportModal open={isExportOpen} onClose={handleClose} onSubmit={mutate} isLoading={isPending || isPolling} progress={progress} />
    </>
  );
};
