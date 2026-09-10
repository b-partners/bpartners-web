import { RaMoneyField } from '@/common/components';
import ArchiveBulkAction from '@/common/components/ArchiveBulkAction';
import { BPImport } from '@/common/components/BPImport';
import { RaPercentageField } from '@/common/components/Field/RaPercentageField';
import { useIsTablet } from '@/common/hooks';
import { prettyPrintMinors } from '@/common/utils';
import { Datagrid, FunctionField, List, SimpleList, TextInput, useListContext } from 'react-admin';
import BPListActions from '../../common/components/BPListActions';
import { EmptyList } from '../../common/components/EmptyList';
import ListComponent from '../../common/components/ListComponent';
import Pagination, { pageSize } from '../../common/components/Pagination';
import useGetAccountHolder from '../../common/hooks/use-get-account-holder';

const productFilter = [
  <TextInput label='Filtrer par description' source='descriptionFilter' key='descriptionFilter' size='small' alwaysOn name='descriptionFilter' />,
  <TextInput label='Filtrer par prix unitaire' source='priceFilter' key='priceFilter' size='small' alwaysOn name='priceFilter' />,
];

const ProductList = () => (
  <List
    actions={<BPListActions hasCreate hasExport={true} fileName={'products'} importComponent={<BPImport source='product' />} buttons={<ArchiveBulkAction />} />}
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
  const isSubjectToVat = !!companyInfo?.isSubjectToVat;
  const isTablet = useIsTablet();
  if (isLoading) return false;
  if (isTablet)
    return (
      <SimpleList
        linkType='edit'
        primaryText={record => record.description}
        secondaryText={record => (isSubjectToVat ? `${prettyPrintMinors(record.unitPriceWithVat)} TTC` : `${prettyPrintMinors(record.unitPrice)} HT`)}
      />
    );
  return (
    !isLoading && (
      <Datagrid rowClick='edit' empty={<EmptyList />}>
        <FunctionField
          source='description'
          label='Description'
          render={({ description }) => (description.length < 60 ? description : description.slice(0, 60) + '...')}
        />
        <RaMoneyField map={false} label='Prix unitaire HT' source='unitPrice' render={data => data?.unitPrice} />
        {isSubjectToVat && <RaPercentageField map={false} label='TVA' source='vatPercent' render={data => data?.vatPercent} />}
        {isSubjectToVat && <RaMoneyField map={false} label='Prix unitaire TTC' source='unitPriceWithVat' render={data => data?.unitPriceWithVat} />}
      </Datagrid>
    )
  );
};

export default ProductList;
