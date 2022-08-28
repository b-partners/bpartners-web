import React from 'react'
import { Show, SimpleShowLayout, TextField, FunctionField } from 'react-admin'
import { Currency, prettyPrintMoney } from '../utils/money'

export const TransactionLayout = () => {
  return (
    <SimpleShowLayout>
      <TextField source='label' label='label' />
      <TextField source='swanTransactionId' label='Transaction ID' />
      <TextField source='reference' label='Référence' />
      <FunctionField source='amount' render={record => prettyPrintMoney(record.amount, Currency.EUR)} label='Montant' />
      <FunctionField source='category' render={record => record.label} label='Catégorie' />
      <FunctionField source='paymentDatetime' render={record => new Date(record.paymentDatetime).toLocaleDateString()}
                     label='Date de paiement' />
    </SimpleShowLayout>
  )
}

const TransactionShow = props => {
  return (
    <Show title={props.label} {...props} resource="transactions">
      <TransactionLayout />
    </Show>
  )
}


export default TransactionShow
