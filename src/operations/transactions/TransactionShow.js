import React from 'react';
import { Show, SimpleShowLayout, TextField, FunctionField } from 'react-admin';

import { prettyPrintMinors } from '../utils/money';
import { formatDate } from '../utils/date';

export const TransactionLayout = () => {
  return (
    <SimpleShowLayout>
      <TextField source='label' label='label' />
      <TextField source='swanTransactionId' label='Transaction ID' />
      <FunctionField source='amount' render={record => prettyPrintMinors(record.amount)} label='Montant' />
      <FunctionField source='category' render={record => record.label} label='Catégorie' />
      <FunctionField render={record => formatDate(new Date(record.paymentDatetime))} label='Date de paiement' />
    </SimpleShowLayout>
  );
};

export const TransactionShow = props => {
  return (
    <Show id={props.paymentReqId} resource='transactions' title='Mes transactions' {...props}>
      <TransactionLayout />
    </Show>
  );
};

export default TransactionShow;
