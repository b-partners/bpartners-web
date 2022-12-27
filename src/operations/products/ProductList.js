import { Datagrid, List, TextField, FunctionField, useListContext } from 'react-admin';
import { EmptyList } from '../utils/EmptyList';
import ListComponent from '../utils/ListComponent';

import { prettyPrintMinors as ppMoneyMinors } from '../utils/money';
import { prettyPrintMinors as ppVatMinors } from '../utils/vat';

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
        <FunctionField source='unitPrice' label='Prix unitaire HT' render={record => ppMoneyMinors(record.unitPrice)} />
        <FunctionField source='vatPercent' label='TVA' render={record => ppVatMinors(record.vatPercent)} />
        <FunctionField source='totalPriceWithVat' label='Prix unitaire TTC' render={record => ppMoneyMinors(record.totalPriceWithVat / record.quantity)} />
      </Datagrid>
    )
  );
};

export default ProductList;
