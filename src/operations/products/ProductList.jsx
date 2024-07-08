import { Datagrid, FunctionField, List, TextInput, useListContext } from 'react-admin';
import { RaMoneyField } from 'src/common/components';
import ArchiveBulkAction from 'src/common/components/ArchiveBulkAction';
import { BPImport } from 'src/common/components/BPImport';
import { RaPercentageField } from 'src/common/components/Field/RaPercentageField';
import BPListActions from '../../common/components/BPListActions';
import { EmptyList } from '../../common/components/EmptyList';
import ListComponent from '../../common/components/ListComponent';
import Pagination, { pageSize } from '../../common/components/Pagination';
import useGetAccountHolder from '../../common/hooks/use-get-account-holder';

const productFilter = [
  <TextInput label='Filtrer par description' source='descriptionFilter' size='small' alwaysOn name='descriptionFilter' />,
  <TextInput label='Filtrer par prix unitaire' source='priceFilter' size='small' alwaysOn name='priceFilter' />,
];

const ProductList = () => (
  <List
    actions={<BPListActions hasExport={true} fileName={'products'} importComponent={<BPImport source='product' />} buttons={<ArchiveBulkAction />} />}
    resource='products'
    hasCreate={true}
    hasEdit={false}
    hasList={false}
    hasShow={false}
    filters={productFilter}
    filter={{ mapped: true }}
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
        <RaMoneyField map={false} label='Prix unitaire HT' source='unitPrice' render={data => data?.unitPrice} />
        {isSubjectToVat && <RaPercentageField map={false} label='TVA' source='vatPercent' render={data => data?.vatPercent} />}
        {isSubjectToVat && <RaMoneyField map={false} label='Prix unitaire TTC' source='unitPriceWithVat' render={data => data?.unitPriceWithVat} />}
      </Datagrid>
    )
  );
};

export default ProductList;
