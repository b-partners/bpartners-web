import { Datagrid, FunctionField, List, useListContext } from 'react-admin';
import { EmptyList } from '../utils/EmptyList';
import ListComponent from '../utils/ListComponent';

import { prettyPrintMinors as ppMoneyMinors } from '../utils/money';
import { prettyPrintMinors as ppVatMinors } from '../utils/vat';

import CustomListActions from '../utils/CustomListActions';
import Pagination, { pageSize } from '../utils/Pagination';
import useGetAccountHolder from '../utils/useGetAccountHolder';

const ProductList = props => (
  <List
    {...props}
    actions={<CustomListActions />}
    resource='products'
    hasCreate={true}
    hasEdit={false}
    hasList={false}
    hasShow={false}
    component={ListComponent}
    pagination={<Pagination />}
    perPage={pageSize}
  >
    <Product />
  </List>
);

const Product = () => {
  const { isLoading } = useListContext();
  const { companyInfo } = useGetAccountHolder();
  const isSubjectToVat = companyInfo && companyInfo.isSubjectToVat;
  return (
    !isLoading && (
      <Datagrid bulkActionButtons={false} empty={<EmptyList />}>
        <FunctionField
          source='description'
          label='Description'
          render={({ description }) =>
            //TODO: test is missing
            description.length < 60 ? description : description.slice(0, 60) + '...'
          }
        />
        <FunctionField source='unitPrice' label='Prix unitaire HT' render={record => ppMoneyMinors(record.unitPrice)} />
        {isSubjectToVat && <FunctionField source='vatPercent' label='TVA' render={record => ppVatMinors(record.vatPercent)} />}
        {isSubjectToVat && <FunctionField source='unitPriceWithVat' label='Prix unitaire TTC' render={record => ppMoneyMinors(record.unitPriceWithVat)} />}
      </Datagrid>
    )
  );
};

export default ProductList;
