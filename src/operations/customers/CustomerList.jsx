import ArchiveBulkAction from '@/common/components/ArchiveBulkAction';
import { PALETTE_COLORS } from '@/common/config/theme';
import { useIsTablet } from '@/common/hooks';
import { Datagrid, List, SimpleList, TextField, TextInput } from 'react-admin';
import { BPImport } from '../../common/components/BPImport';
import BPListActions from '../../common/components/BPListActions';
import { EmptyList } from '../../common/components/EmptyList';
import ListComponent from '../../common/components/ListComponent';
import Pagination, { pageSize } from '../../common/components/Pagination';

const customerFilter = [
  <TextInput key='customerListSearch' source='customerListSearch' name='customerListSearch' label='Rechercher un client' size='small' alwaysOn />,
];

const CustomerList = props => {
  const isTablet = useIsTablet();
  return (
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
      {isTablet ? (
        <SimpleList
          linkType='edit'
          primaryText={record => `${record.lastName || ''} ${record.firstName || ''}`.trim()}
          secondaryText={record => record.email}
          tertiaryText={record => record.phone}
        />
      ) : (
        <Datagrid
          rowClick='edit'
          empty={<EmptyList />}
          sx={{
            '& .RaDatagrid-headerCell': {
              backgroundColor: PALETTE_COLORS.pine,
            },
          }}
        >
          <TextField source='lastName' label='Nom' />
          <TextField source='firstName' label='Prénom' />
          <TextField source='email' label='Email' />
          <TextField source='address' label='Adresse' />
          <TextField source='phone' label='Téléphone' />
        </Datagrid>
      )}
    </List>
  );
};

export default CustomerList;
