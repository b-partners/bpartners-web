import { Datagrid, List, TextField, SavedQueriesList, FilterLiveSearch } from "react-admin";
import { Card, CardContent } from '@mui/material';
import { Box, CardHeader } from "@material-ui/core";

const FilterSearch = () => (
  <FilterLiveSearch margin='normal' />
);

const FilterSidebar = () => (
  <Box
    sx={{
      display: {
        xs: 'none',
        md: 'block',
      },
      order: -1,
      width: '15em',
      marginRight: '1em',
      marginTop: '4.2em'
    }}
  >
    <Card sx={{
      px: 1.5
    }}
    >
      <CardHeader component={FilterSearch} />
      <CardContent>
        <SavedQueriesList />
      </CardContent>
    </Card>
  </Box>
);

const TransactionList = props => {
  return (
    <List
      {...props}
      aside={<FilterSidebar />}
      resource='transactions'
    >
      <Datagrid rowClick="show" >
        <TextField source='id' label='id'/>
        <TextField source='amount' label='Montant' />
        <TextField source='title' label='Libellé' />
        <TextField source='paymentReqId' label='id du requête' />
        <TextField source='updateDateTime' label='Dernière modification' />
      </Datagrid>
    </List>
  );
}

export default TransactionList;
