import { TextInput, email, required } from 'react-admin';
import { useWatch } from 'react-hook-form';

const FormCustomer = () => {
  const values = useWatch();
  return (
    <>
      {values?.customerType === 'PROFESSIONAL' && <TextInput name='name' source='name' label='Nom de la société' validate={required()} />}
      <TextInput name='lastName' source='lastName' label='Nom' validate={required()} />
      <TextInput name='firstName' source='firstName' label='Prénom' validate={required()} />
      <TextInput name='email' source='email' label='Email' validate={[email('Doit être un email valide'), required()]} />
      <TextInput name='address' source='address' label='Adresse' validate={required()} />
      <TextInput name='phone' source='phone' label='Téléphone' validate={required()} />
      <TextInput name='comment' source='comment' label='Commentaire' multiline />
    </>
  );
};

export default FormCustomer;
