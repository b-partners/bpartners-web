import ArchiveBulkAction from '@/common/components/ArchiveBulkAction';
import { Datagrid, List, TextField, TextInput, useListContext } from 'react-admin';
import { BPImport } from '../../common/components/BPImport';
import BPListActions from '../../common/components/BPListActions';
import { EmptyList } from '../../common/components/EmptyList';
import ListComponent from '../../common/components/ListComponent';
import Pagination, { pageSize } from '../../common/components/Pagination';

const customerFilter = [
  <TextInput key='customerListSearch' source='customerListSearch' name='customerListSearch' label='Rechercher un client' size='small' alwaysOn />,
];

const CustomerList = props => (
  <List
    {...props}
    perPage={pageSize}
    actions={
      <BPListActions
        hasCreate={true}
        hasExport={true}
        fileName={'customers'}
        buttons={<ArchiveBulkAction source='lastName ||| firstName' />}
        importComponent={<BPImport source='customer' />}
      />
    }
    resource='customers'
    hasEdit={false}
    hasList={false}
    hasShow={false}
    filters={customerFilter}
    component={ListComponent}
    pagination={<Pagination />}
    sx={{
      '& .RaBulkActionsToolbar-toolbar': { display: 'none' },
    }}
  >
    <CustomerGrid />
  </List>
);

const CustomerGrid = () => {
  const { isLoading } = useListContext();

  if (isLoading) return null;

  return (
    <Datagrid rowClick='edit' empty={<EmptyList />}>
      <TextField source='lastName' label='Nom' />
      <TextField source='firstName' label='Prénom' />
      <TextField source='email' label='Email' />
      <TextField source='address' label='Adresse' />
      <TextField source='phone' label='Téléphone' />
    </Datagrid>
  );
};

export default CustomerList;
