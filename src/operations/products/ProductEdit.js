import { Edit, required, SimpleForm, TextInput, useInput } from 'react-admin';
import { TextField } from '@mui/material';
import BPFormLayout from '../../common/components/BPFormLayout';
import useGetAccountHolder from '../../common/hooks/use-get-account-holder';
import { toMajors, toMinors } from 'src/common/utils/money';

const ProductEdit = () => {
  const { companyInfo } = useGetAccountHolder();
  const isSubjectToVat = companyInfo && companyInfo.isSubjectToVat;

  const PriceInput = ({ source, label }) => {
    const { id, field, isRequired } = useInput({ source });

    const handleChange = e => field.onChange({ target: { value: toMinors(+e.target.value) } });
    const customsField = { ...field, onChange: handleChange, value: toMajors(field.value) };

    return (
      <>
        <TextField id={id} type='number' {...customsField} label={label} required={isRequired} /> &nbsp;
      </>
    );
  };
  return (
    <BPFormLayout title='Édition de produit' resource='products'>
      <Edit mutationMode='pessimistic'>
        <SimpleForm title='Édition de produit'>
          <TextInput name='description' source='description' label='Description' validate={required()} />
          <PriceInput name='unitPrice' source='unitPrice' label='Prix unitaire HT' />
          {isSubjectToVat && <TextInput source='vatPercent' label='TVA' />}
        </SimpleForm>
      </Edit>
    </BPFormLayout>
  );
};

export default ProductEdit;
