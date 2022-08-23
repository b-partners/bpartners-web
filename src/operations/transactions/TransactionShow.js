import React from 'react'
import { Show, SimpleShowLayout, TextField } from 'react-admin';

export const TransactionLayout = () => {
    return (
        <SimpleShowLayout>
            <TextField source='amount' label='Amount' />
            <TextField source='title' label='Title' />
            <TextField source='paymentReqId' label='Id' />
            <TextField source='updateDateTime' label='Last Modification' />
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
