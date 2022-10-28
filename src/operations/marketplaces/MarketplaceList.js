import { Datagrid, FunctionField, List, TextField, useListContext } from 'react-admin';
import { Stack, Avatar, Typography } from '@mui/material';
import { StoreSharp } from '@material-ui/icons';
import { EmptyList } from '../utils/EmptyList';
import PrevNextPagination, { pageSize } from '../utils/PrevNextPagination';

const MarketplaceList = props => {
  const { data, isLoading } = useListContext();
  const resourcesCount = data ? data.length : 0;
  const shouldPaginate = isLoading || resourcesCount < pageSize;

  return (
    <List
      {...props}
      resource='marketplaces'
      exporter={resourcesCount > 0}
      hasCreate={false}
      hasEdit={false}
      hasList={false}
      hasShow={false}
      pagination={shouldPaginate ? null : <PrevNextPagination />}
    >
      <Datagrid bulkActionButtons={false} empty={<EmptyList />}>
        <FunctionField
          label='Marché'
          render={({ logoUrl, name }) => (
            <Stack direction='row' spacing={2}>
              <Avatar variant='rounded' src={logoUrl}>
                <StoreSharp />
              </Avatar>
              <Typography variant='h6'>{name}</Typography>
            </Stack>
          )}
        />
        <TextField source='phoneNumber' label='Numéro de téléphone' />
        <TextField source='websiteUrl' label='Site web' />
        <TextField source='description' label='Déscription' />
      </Datagrid>
    </List>
  );
};

export default MarketplaceList;
