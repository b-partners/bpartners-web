import { List } from '@react-admin/ra-rbac';
import {
  Datagrid, TextField, DateField, FunctionField, TopToolbar, CreateButton,
} from 'react-admin';

import { prettyPrintMoney } from '../utils/money';

function Actions({ basePath, resource }) {
  return (
    <TopToolbar disableGutters>
      <CreateButton to={`${basePath}/create`} resource={resource} />
    </TopToolbar>
  );
}

function PaymentList({ feeId }) {
  return (
    <List
      title=" " // is appended to ContainingComponent.title, default is ContainingComponent.title... so need to set it!
      resource="payments"
      actions={<Actions basePath={`/fees/${feeId}/payments`} />}
      filterDefaultValues={{ feeId }}
      pagination={false}
    >
      <Datagrid>
        <DateField source="creation_datetime" label="Date de création" />
        <TextField source="comment" label="Commentaire" />
        <TextField source="type" label="Type" />
        <FunctionField label="Montant" render={(record) => prettyPrintMoney(record.amount)} textAlign="right" />
      </Datagrid>
    </List>
  );
}

export default PaymentList;
