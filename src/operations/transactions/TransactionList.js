import { Datagrid, List, TextField, SavedQueriesList, FilterLiveSearch, FunctionField } from "react-admin";
import { Card, CardContent } from '@mui/material';
import { Currency, prettyPrintMoney } from '../utils/money';
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
      <Datagrid rowClick="show">
        <TextField source='label' label='label' />
        <TextField source='swanTransactionId' label='transaction id' />
        <TextField source='reference' label='reference' />
        <FunctionField source='amount' render={record => prettyPrintMoney(record.amount, Currency.EUR)} label='Amount' />
        <FunctionField source='category' render={record => record.label} label='category' />
        <FunctionField source='paymentDatetime' render={record => new Date(record.paymentDateTime).toLocaleDateString()} label='Last Modification' />
      </Datagrid>
    </List>
  );
}

export default TransactionList;
