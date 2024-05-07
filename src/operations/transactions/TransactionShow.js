import React from 'react';
import { FunctionField, Show, SimpleShowLayout, TextField } from 'react-admin';

import { formatDatetime, prettyPrintMinors } from '../../common/utils';

export const TransactionLayout = () => {
  return (
    <SimpleShowLayout>
      <TextField source='label' label='label' />
      <TextField source='swanTransactionId' label='Transaction ID' />
      <FunctionField source='amount' render={record => prettyPrintMinors(record.amount)} label='Montant' />
      <FunctionField source='category' render={record => record.label} label='Catégorie' />
      <FunctionField render={record => formatDatetime(new Date(record.paymentDatetime))} label='Date de paiement' />
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
