import useGetAccountHolder from '@/common/hooks/use-get-account-holder';
import { prettyPrintMinors } from '@/common/utils';
import { invoiceProvider } from '@/providers';
import { InvoiceStatus } from '@bpartners/typescript-client';
import { Box, Card, CardContent, TextField as MuiTextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Datagrid, FunctionField, ListContextProvider, ResourceContextProvider, TextField, useList, useNotify } from 'react-admin';

const MAX_PER_PAGE = 500;
const { PAID, CONFIRMED } = InvoiceStatus;

const useInvoiceList = () => {
  const [list, setList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const notify = useNotify();

  useEffect(() => {
    const getInvoiceList = async () => {
      setIsLoading(true);
      const data = await invoiceProvider.getList(1, MAX_PER_PAGE, { invoiceTypes: [PAID, CONFIRMED] });
      setList(data);
      setIsLoading(false);
    };
    getInvoiceList().catch(() => notify('messages.global.error', { type: 'error' }));
  }, [notify]);

  const data = useMemo(
    () => (filter.length > 0 && list.length > 0 ? list.filter(invoice => (invoice?.title || '').toLowerCase().includes((filter || '').toLowerCase())) : list),
    [list, filter]
  );

  return { data, setFilter, isLoading };
};

const InvoiceListSelection = props => {
  const { handleRowClick } = props;

  const { data, setFilter, isLoading } = useInvoiceList();

  const listContext = useList({ data, isLoading });
  const handleChange = e => setFilter(e.target.value);

  return (
    <ResourceContextProvider value='invoice'>
      {!isLoading && (
        <Box>
          <MuiTextField label='Rechercher par titre' size='small' onChange={handleChange} />
        </Box>
      )}
      <ListContextProvider value={listContext}>
        {!isLoading && data.length > 0 && (
          <Datagrid bulkActionButtons={false} rowClick={handleRowClick}>
            <TextField source='ref' label='Référence' />
            <TextField source='title' label='Titre' />
            <TextField source='customer.name' label='Client' />
            <PriceRenderer />
          </Datagrid>
        )}
        {isLoading && (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography>Chargement...</Typography>
              </Box>
            </CardContent>
          </Card>
        )}
        {!isLoading && data.length === 0 && (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography>Aucune facture trouvée</Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </ListContextProvider>
    </ResourceContextProvider>
  );
};

const PriceRenderer = () => {
  const { companyInfo } = useGetAccountHolder();
  const isSubjectToVat = companyInfo?.isSubjectToVat;

  const label = isSubjectToVat ? 'Prix total (TTC)' : 'Prix total (HT)';
  const price = isSubjectToVat ? 'totalPriceWithVat' : 'totalPriceWithoutVat';

  return <FunctionField render={data => prettyPrintMinors(data[price])} label={label} />;
};

export default InvoiceListSelection;
