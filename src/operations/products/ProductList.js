import { Datagrid, FunctionField, List, TextInput, useListContext } from 'react-admin';
import { EmptyList } from '../../common/components/EmptyList';
import ListComponent from '../../common/components/ListComponent';
import { BPImport } from 'src/common/components/BPImport';
import BPListActions from '../../common/components/BPListActions';
import Pagination, { pageSize } from '../../common/components/Pagination';
import useGetAccountHolder from '../../common/hooks/use-get-account-holder';
import ArchiveBulkAction from 'src/common/components/ArchiveBulkAction';
import { RaMoneyField } from 'src/common/components';

const productFilter = [
  <TextInput label='Filtrer par description' source='descriptionFilter' size='small' alwaysOn />,
  <TextInput label='Filtrer par prix unitaire' source='priceFilter' size='small' alwaysOn />,
];

const ProductList = () => (
  <List
    actions={<BPListActions importComponent={<BPImport source='product' />} buttons={<ArchiveBulkAction />} />}
    resource='products'
    hasCreate={true}
    hasEdit={false}
    hasList={false}
    hasShow={false}
    filters={productFilter}
    component={ListComponent}
    pagination={<Pagination />}
    perPage={pageSize}
    sx={{
      '& .RaBulkActionsToolbar-toolbar': { display: 'none' },
    }}
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
      <Datagrid rowClick='edit' empty={<EmptyList />}>
        <FunctionField
          source='description'
          label='Description'
          render={({ description }) =>
            //TODO: test is missing
            description.length < 60 ? description : description.slice(0, 60) + '...'
          }
        />
        <RaMoneyField label='Prix unitaire HT' source='unitPrice' render={data => data?.unitPrice} />
        {isSubjectToVat && <RaMoneyField label='TVA' source='vatPercent' render={data => data?.vatPercent} />}
        {isSubjectToVat && <RaMoneyField label='Prix unitaire TTC' source='unitPriceWithVat' render={data => data?.unitPriceWithVat} />}
      </Datagrid>
    )
  );
};

export default ProductList;
