import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { Avatar, Box, Button, LinearProgress, Divider, IconButton, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { InvoiceRelaunch } from 'bpartners-react-client';
import { ListContextProvider, useListController } from 'react-admin';
import { EmptyListTemplate } from 'src/common/components';
import { useInvoiceToolContext } from 'src/common/store/invoice';
import { formatDatetime, stringCutter } from 'src/common/utils';
import { invoiceGetContext } from '../utils';
import { InvoiceListModal } from './InvoiceListModal';
import { InvoiceModalTitle } from './InvoiceModalTitle';
import Pagination from 'src/common/components/Pagination';

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
            Relancer {invoiceGetContext(invoice, 'ce', 'cette')}
          </Button>
        }
      >
        {(isFetching || isLoading) && <LinearProgress color='secondary' />}
        {!isLoading && (data?.length || 0) === 0 && <EmptyListTemplate label='Aucune relance répertoriée' />}
        {!isLoading && (
          <List sx={{ overflowY: 'scroll', overflowX: 'auto' }}>
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
                    primary={`Devis relancé le ${formatDatetime(new Date(relaunch?.creationDatetime))}`}
                    secondary={stringCutter(relaunch?.emailInfo?.emailObject, 50)}
                  />
                </ListItem>
                <Divider variant='inset' component='li' />
              </Box>
            ))}
            {data.length !== 0 && <Pagination />}
          </List>
        )}
      </InvoiceListModal>
    </ListContextProvider>
  );
};
