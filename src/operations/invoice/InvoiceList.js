import { useState, useEffect } from 'react';
import { List, Datagrid, TextField, FunctionField, useNotify, useRefresh } from 'react-admin';
import { Box, IconButton, Tooltip, Typography, Card, CardContent, CardHeader, Tabs, Tab, LinearProgress } from '@mui/material';
import { makeStyles } from '@material-ui/styles';
import { Edit, Check, Send } from '@material-ui/icons';
import InvoiceCreateOrUpdate from './InvoiceCreate';
import { invoiceInitialValue } from './InvoiceCreate';
import PrevNextPagination from '../utils/PrevNextPagination';
import invoiceProvider from 'src/providers/invoice-provider';
import { Document as Pdf, Page as PdfPage } from 'react-pdf/dist/esm/entry.webpack';
import { getInvoicePdfUrl } from './utils';
import TabPanel from '../utils/TabPanel';

const useStyle = makeStyles(() => ({
  document: { width: '60%' },
  invoiceCreate: {},
}));

const Document = props => {
  const { invoice, className, isPending } = props;
  const [state, setState] = useState(null);

  useEffect(() => {
    if (isPending === 0) {
      getInvoicePdfUrl(invoice.fileId).then(res => setState(res));
    }
  }, [invoice, isPending > 0]);

  return (
    <Box className={className}>
      <Card>
        {isPending > 0 && <LinearProgress />}
        <CardHeader title='Justificatif' />
        <CardContent>
          {state !== null && invoice.id.length > 0 && (
            <Pdf file={state}>
              <PdfPage pageNumber={1} />
            </Pdf>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

const InvoiceListTable = props => {
  const { onChange } = props;
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

  const handleChange = data => {
    onChange(e => ({ ...e, tabIndex: 1, selectedInvoice: { ...data, id: '' } }));
  };

  return (
    <List exporter={false} resource='invoices' pagination={<PrevNextPagination />}>
      <Datagrid>
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
                <Tooltip title='modifier' onClick={() => handleChange(data)}>
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

const InvoiceList = () => {
  const [{ selectedInvoice, tabIndex, isPending }, setState] = useState({ tabIndex: 0, selectedInvoice: invoiceInitialValue, isPending: 0 });
  const classes = useStyle();

  const handleTabChange = (event, newTabIndex) => {
    setState(e => ({ ...e, tabIndex: newTabIndex }));
  };

  const handlePending = type => {
    setState(e => ({ ...e, isPending: e.isPending + (type === 'increase' ? 1 : -1) }));
  };

  return (
    <Box>
      <Tabs value={tabIndex} onChange={handleTabChange} variant='fullWidth'>
        <Tab label='Liste' />
        <Tab label='Modification' />
      </Tabs>
      <TabPanel value={tabIndex} index={0} sx={{ p: 3 }}>
        <InvoiceListTable onChange={setState} />
      </TabPanel>
      <TabPanel value={tabIndex} sx={{ p: 3, display: 'flex', width: 'inherit', justifyContent: 'space-around' }} index={1}>
        <InvoiceCreateOrUpdate onPending={handlePending} className={classes.invoiceCreate} toEdit={selectedInvoice} />
        <Document isPending={isPending} className={classes.document} invoice={selectedInvoice} />
      </TabPanel>
    </Box>
  );
};

export default InvoiceList;
