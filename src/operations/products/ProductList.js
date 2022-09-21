import { Datagrid, List, TextField, useListContext } from 'react-admin';

import PrevNextPagination, { pageSize } from '../utils/PrevNextPagination';

const ProductList = props => {
  const { data, isLoading } = useListContext();
  const resourcesCount = data ? data.length : 0;
  const shouldPaginate = isLoading || resourcesCount < pageSize;

  return (
    <List
      {...props}
      resource='products'
      hasCreate={true}
      hasEdit={false}
      hasList={false}
      hasShow={false}
      pagination={shouldPaginate ? null : <PrevNextPagination />}
    >
      <Datagrid bulkActionButtons={false}>
        <TextField source='description' label='Déscription' />
        <TextField source='quantity' label='Quantité' />
        <TextField source='unitPrice' label='Prix unitaire' />
        <TextField source='vatPercent' label='Pourcentage du TVA' />
        <TextField source='totalVat' label='Total du TVA' />
        <TextField source='totalPriceWithVat' label='Prix total avec le TVA' />
      </Datagrid>
    </List>
  );
};

export default ProductList;
