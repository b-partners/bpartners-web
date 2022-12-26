import { Datagrid, List, TextField, FunctionField, useListContext } from 'react-admin';
import { EmptyList } from '../utils/EmptyList';
import ListComponent from '../utils/ListComponent';

import { prettyPrintMinors } from '../utils/money';

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
      <ProductGrid />
    </List>
  );
};

const ProductGrid = () => {
  const { isLoading } = useListContext();

  return (
    !isLoading && (
      <Datagrid bulkActionButtons={false} empty={<EmptyList />}>
        <TextField source='description' label='Description' />
        <FunctionField source='unitPrice' label='Prix unitaire HT' render={record => prettyPrintMinors(record.unitPrice)} />
        <FunctionField source='vatPercent' label='TVA' render={record => record.vatPercent + ' %'} />
        <FunctionField source='totalPriceWithVat' label='Prix unitaire TTC' render={record => prettyPrintMinors(record.totalPriceWithVat / record.quantity)} />
      </Datagrid>
    )
  );
};

export default ProductList;
