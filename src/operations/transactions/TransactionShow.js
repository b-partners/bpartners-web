import React from 'react'
import { Show, SimpleShowLayout, TextField, FunctionField } from 'react-admin';
import { Currency, prettyPrintMoney } from '../utils/money';

export const TransactionLayout = () => {
    return (
        <SimpleShowLayout>
            <TextField source='label' label='label' />
            <TextField source='swanTransactionId' label='transaction id' />
            <TextField source='reference' label='reference' />
            <FunctionField source='amount' render={record => prettyPrintMoney(record.amount, Currency.EUR)} label='Amount' />
            <FunctionField source='category' render={record => record.label} label='category' />
            <FunctionField source='paymentDatetime' render={record => new Date(record.updateDateTime).toLocaleDateString()} label='Last Modification' />
        </SimpleShowLayout>
    );
};

export const TransactionShow = props => {
    return (
        <Show id={props.paymentReqId} resource="transactions" title='Mes transactions' {...props}>
            <TransactionLayout />
        </Show>
    );
};


export default TransactionShow;
