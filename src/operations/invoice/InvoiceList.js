import { useState } from 'react';
import { List, Datagrid, TextField, FunctionField, useNotify, useRefresh } from 'react-admin';
import { Edit, Check, Send } from '@material-ui/icons';
import { Box, IconButton, Tooltip, Typography } from '@material-ui/core';
import { EmptyList } from '../utils/EmptyList';
import InvoiceCreateOrUpdate from './InvoiceCreate';
import { invoiceInitialValue } from './InvoiceCreate';
import PrevNextPagination from '../utils/PrevNextPagination';
import invoiceProvider from 'src/providers/invoice-provider';

const InvoiceList = () => {
  const [invoice, setInvoice] = useState(invoiceInitialValue);
  const notify = useNotify();
  const refresh = useRefresh();

  const sendInvoice = data => {
    data.status = 'PROPOSAL';
    invoiceProvider
      .saveOrUpdate([data])
      .then(() => {
        notify('Facture bien envoyer', { type: 'success' });
        refresh();
      })
      .catch(() => {
        notify("Une erreur s'est produite", { type: 'error' });
      });
  };

  return (
    <List
      resource='invoices'
      pagination={<PrevNextPagination />}
      hasCreate={false}
      hasEdit={false}
      hasList={false}
      hasShow={false}
      aside={<InvoiceCreateOrUpdate toEdit={invoice} />}
    >
      <Datagrid empty={<EmptyList />}>
        <TextField source='ref' label='Référence' />
        <TextField source='title' label='Titre' />
        <TextField source='customer[name]' label='Client' />
        <FunctionField render={data => <Typography variant='body2'>{data.totalVat}€</Typography>} label='TVA' />
        <FunctionField render={data => <Typography variant='body2'>{data.totalPriceWithVat}€</Typography>} label='Prix total' />
        <TextField source='toPayAt' label='Date de payment' />
        <FunctionField
          render={data =>
            data.status === 'DRAFT' ? (
              <Box sx={{ display: 'flex' }}>
                <Tooltip title='modifier' onClick={() => setInvoice({ ...data })}>
                  <IconButton>
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title='envoyer' onClick={() => sendInvoice({ ...data })}>
                  <IconButton>
                    <Send />
                  </IconButton>
                </Tooltip>
              </Box>
            ) : (
              <Tooltip title='Confirmer'>
                <IconButton>
                  <Check />
                </IconButton>
              </Tooltip>
            )
          }
          label='Modifier'
        />
      </Datagrid>
    </List>
  );
};

export default InvoiceList;
