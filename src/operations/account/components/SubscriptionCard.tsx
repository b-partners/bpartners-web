import { useToggle } from '@/common/hooks';
import { InvoiceExportFilters, InvoiceExportModal } from '@/operations/invoice/components';
import { downloadExportBatches, getExportReadyBatches, isExportRequestReady, retrieveInvoicesExportRequest, submitInvoicesExportRequest } from '@/providers';
import ArrowRightRoundedIcon from '@mui/icons-material/ArrowRightRounded';
import { Box, Button, Card, CardContent, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useNotify } from 'react-admin';
import { subscriptionFeatures } from './subscriptionFeatures';

const DATE_FORMAT = 'YYYY-MM-DD';
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_COUNT = 100;

export const SubscriptionCard = () => {
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
    refetchInterval: ({ state }) => (isExportRequestReady(state.data) || pollCount.current >= MAX_POLL_COUNT ? false : POLL_INTERVAL_MS),
  });

  const isPolling = !!requestId && !isExportRequestReady(exportRequest);
  const totalBatchCount = exportRequest?.totalBatchCount || 0;
  const progress = totalBatchCount > 0 ? (getExportReadyBatches(exportRequest).length / totalBatchCount) * 100 : undefined;

  useEffect(() => {
    if (!requestId || !exportRequest) return;

    if (isExportRequestReady(exportRequest)) {
      if (exportRequest.totalInvoiceCount === 0) {
        notify('Aucune facture ne correspond aux critères sélectionnés.', { type: 'warning' });
        setRequestId(null);
        return;
      }
      downloadExportBatches(exportRequest);
      notify('Le téléchargement de vos factures a démarré.', { type: 'success' });
      setRequestId(null);
      handleClose();
    } else if (pollCount.current >= MAX_POLL_COUNT) {
      notify('La préparation de vos factures est trop longue. Réessayez dans quelques minutes.', { type: 'error' });
      setRequestId(null);
    }
  }, [requestId, exportRequest, dataUpdatedAt]);

  return (
    <Card className='card subscription-card'>
      <CardContent>
        <Box className='subscription-header'>
          <Typography className='section-title-subscription'>Mon abonnement</Typography>
          <Button variant='contained' className='export-invoice-action' name='open-invoice-export-modal' onClick={handleOpen}>
            Télécharger mes factures
          </Button>
        </Box>
        <Typography className='price-subscription'>Pour 49 € par mois :</Typography>

        <List disablePadding>
          {subscriptionFeatures.map((item, index) => (
            <ListItem key={index} className='list-subscription' sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <ArrowRightRoundedIcon className='arrow-list' />
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <InvoiceExportModal open={isExportOpen} onClose={handleClose} onSubmit={mutate} isLoading={isPending || isPolling} progress={progress} />
        <Typography className='unsubscribe-text'>
          Pour résilier votre abonnement merci d'écrire à <a href='mailto:contact@birdia.fr'>contact@birdia.fr</a>.
        </Typography>
      </CardContent>
    </Card>
  );
};
