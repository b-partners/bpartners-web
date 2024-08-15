import { EmptyListTemplate } from '@/common/components';
import Pagination from '@/common/components/Pagination';
import { useInvoiceToolContext } from '@/common/store/invoice';
import { formatDateTime, stringCutter } from '@/common/utils';
import { InvoiceRelaunch } from '@bpartners/typescript-client';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { Avatar, Box, Button, Divider, IconButton, LinearProgress, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { ListContextProvider, useListController } from 'react-admin';
import { invoiceGetContext } from '../utils';
import { InvoiceListModal } from './InvoiceListModal';
import { InvoiceModalTitle } from './InvoiceModalTitle';

export const InvoiceRelaunchHistoryModal = () => {
  const {
    modal: { invoice },
    openModal,
  } = useInvoiceToolContext();
  const invoiceRelaunchListController = useListController({ resource: 'invoiceRelaunch', perPage: 10, filter: { invoiceId: invoice?.id || '' } });

  const { data, isLoading, isFetching } = invoiceRelaunchListController;

  const showRelaunch = (relaunch: InvoiceRelaunch) => () => {
    openModal({ invoice, isOpen: true, type: 'RELAUNCH_SHOW', metadata: relaunch });
  };

  return (
    <ListContextProvider value={invoiceRelaunchListController}>
      <InvoiceListModal
        type='RELAUNCH_HISTORY'
        title={<InvoiceModalTitle invoice={invoice} label='Historique de relance' />}
        actions={
          <Button data-testid='relaunch-invoice' onClick={() => openModal({ invoice, isOpen: true, type: 'RELAUNCH' })}>
            {(data?.length || 0) === 0 ? 'Envoyer ' + invoiceGetContext(invoice, 'un', 'une') : 'Relancer ' + invoiceGetContext(invoice, 'ce', 'cette')}
          </Button>
        }
      >
        {(isFetching || isLoading) && <LinearProgress color='secondary' />}
        {!isLoading && (data?.length || 0) === 0 && <EmptyListTemplate label='Aucune relance répertoriée' />}
        {!isLoading && (
          <List sx={{ overflowY: 'scroll', overflowX: 'hidden', height: '40vh', paddingBlock: '1rem' }}>
            {data?.map((relaunch, k) => (
              <Box key={'Invoice-relaunch-list-' + relaunch?.id + k}>
                <ListItem
                  secondaryAction={
                    <IconButton title='Voir plus' onClick={showRelaunch(relaunch)}>
                      <VisibilityIcon />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar>{k + 1}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`Devis relancé le ${formatDateTime(new Date(relaunch?.creationDatetime))}`}
                    secondary={stringCutter(relaunch?.emailInfo?.emailObject, 50)}
                  />
                </ListItem>
                <Divider variant='inset' component='li' />
              </Box>
            ))}
          </List>
        )}
        {!isLoading && data.length !== 0 && <Pagination />}
      </InvoiceListModal>
    </ListContextProvider>
  );
};
