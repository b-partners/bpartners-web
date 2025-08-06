import { Grid } from '@mui/material';
import { ShowBase, SimpleShowLayout } from 'react-admin';
import { CustomersBloc } from './components/Customers';
import { InvoiceDevisBloc } from './components/InvoiceDevis';
import { InvoiceFacturesBloc } from './components/InvoiceFactures';
import { ProductsBloc } from './components/Products';
import { ProspectsBloc } from './components/prospects';
import { GlobalBlocStyle } from './components/style';

export const AccountShow = () => {
  return (
    <ShowBase id='' resource='accountHolder'>
      <SimpleShowLayout>
        <Grid sx={GlobalBlocStyle} container spacing={2}>
          <Grid item xs={12}>
            <ProspectsBloc />
          </Grid>
          <Grid item xs={12}>
            <CustomersBloc />
          </Grid>
          <Grid item xs={12}>
            <ProductsBloc />
          </Grid>
          <Grid item xs={12}>
            <InvoiceDevisBloc />
          </Grid>
          <Grid item xs={12}>
            <InvoiceFacturesBloc />
          </Grid>
        </Grid>
      </SimpleShowLayout>
    </ShowBase>
  );
};
