import { Datagrid, FunctionField, List, TextField, useListContext } from 'react-admin';
import { EmptyList } from '../utils/EmptyList';
import ListComponent from '../utils/ListComponent';

import PrevNextPagination from '../utils/PrevNextPagination';

const ProductList = props => {
  const { data } = useListContext();
  const resourcesCount = data ? data.length : 0;

  return (
    <List
      {...props}
      resource='products'
      exporter={resourcesCount > 0}
      hasCreate={true}
      hasEdit={false}
      hasList={false}
      hasShow={false}
      component={ListComponent}
      pagination={<PrevNextPagination />}
    >
      <Product />
    </List>
  );
};

const Product = () => {
  const { isLoading } = useListContext();

  return (
    !isLoading && (
      <Datagrid bulkActionButtons={false} empty={<EmptyList />}>
        <TextField source='description' label='Description' />
        <TextField source='quantity' label='Quantité' />
        <TextField source='unitPrice' label='Prix unitaire' />
        <FunctionField source='vatPercent' label='Pourcentage du TVA' render={record => record.vatPercent / 100} inputMode='numeric' />
        <TextField source='totalVat' label='Total du TVA' />
        <TextField source='totalPriceWithVat' label='Prix total avec le TVA' />
      </Datagrid>
    )
  );
};

export default ProductList;
