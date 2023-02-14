import { Datagrid, FunctionField, List, useListContext } from 'react-admin';
import { EmptyList } from '../../common/components/EmptyList';
import ListComponent from '../../common/components/ListComponent';

import { prettyPrintMinors as ppMoneyMinors } from '../../common/utils/money';
import { prettyPrintMinors as ppVatMinors } from '../../common/utils/vat';

import BPListActions from '../../common/components/BPListActions';
import Pagination, { pageSize } from '../../common/components/Pagination';
import useGetAccountHolder from '../../common/hooks/use-get-account-holder';

const ProductList = props => (
  <List
    {...props}
    actions={<BPListActions />}
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
