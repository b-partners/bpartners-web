import { Datagrid, List, TextField, useListContext } from 'react-admin';
import { EmptyList } from '../utils/EmptyList';
import PrevNextPagination from '../utils/PrevNextPagination';

const CustomerList = props => {
  const { data } = useListContext();
  const resourcesCount = data ? data.length : 0;

  return (
    <List
      {...props}
      exporter={resourcesCount > 0}
      resource='customers'
      hasCreate={true}
      hasEdit={false}
      hasList={false}
      hasShow={false}
      pagination={<PrevNextPagination />}
    >
      <Datagrid bulkActionButtons={false} empty={<EmptyList />}>
        <TextField source='name' label='Nom' />
        <TextField source='email' label='Email' />
        <TextField source='address' label='Addresse' />
        <TextField source='phone' label='Téléphone' />
      </Datagrid>
    </List>
  );
};

export default CustomerList;
