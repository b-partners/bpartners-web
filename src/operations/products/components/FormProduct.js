import React from 'react';
import { TextInput, required } from 'react-admin';
import { RaNumberInput } from 'src/common/components';
import useGetAccountHolder from 'src/common/hooks/use-get-account-holder';

const FormProduct = () => {
  const { companyInfo } = useGetAccountHolder();
  return (
    <>
      <RaNumberInput validate={[required()]} source='unitPrice' label='Prix unitaire HT' sx={{ minWidth: '25vw' }} name='unitPrice' endText='€' />
      {companyInfo && companyInfo.isSubjectToVat && (
        <RaNumberInput validate={[required()]} source='vatPercent' label='TVA' sx={{ minWidth: '25vw' }} name='vatPercent' endText='%' />
      )}
      <TextInput validate={[required()]} source='description' label='Description' multiline={true} minRows={3} fullWidth name='description' />
    </>
  );
};

export default FormProduct;
