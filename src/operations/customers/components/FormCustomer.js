import { TextInput, email, required } from 'react-admin';

const FormCustomer = props => {
  const { userType } = props;
  return (
    <>
      <TextInput name='lastName' source='lastName' label={userType === 'professionnel' ? 'Nom de la société' : 'Nom'} validate={required()} />
      <TextInput
        name='firstName'
        source='firstName'
        label={userType === 'professionnel' ? "Prénom - Nom de l'interlocuteur" : 'Prénom'}
        validate={required()}
      />
      <TextInput name='email' source='email' label='Email' validate={[email('Doit être un email valide'), required()]} />
      <TextInput name='address' source='address' label='Adresse' validate={required()} />
      <TextInput name='phone' source='phone' label='Téléphone' validate={required()} />
      <TextInput name='comment' source='comment' label='Commentaire' multiline />
    </>
  );
};

export default FormCustomer;
