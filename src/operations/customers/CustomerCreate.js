import { Create, required, SimpleForm, TextInput, email } from 'react-admin';
import BPFormLayout from '../../common/components/BPFormLayout';
import { RadioGroup, Radio, FormControlLabel } from '@mui/material';
import { useState } from 'react';

const CustomerCreate = props => {
  const [userType, setUserType] = useState('particulier');

  return (
    <BPFormLayout title='Création de client' resource='customers'>
      <RadioGroup aria-labelledby='demo-radio-buttons-group-label' name='radio-buttons-group' value={userType} onChange={e => setUserType(e.target.value)} row>
        <FormControlLabel data-testid='userType-particulier' value='particulier' control={<Radio />} label='Particulier' />
        <FormControlLabel data-testid='userType-professionnel' value='professionnel' control={<Radio />} label='Professionnel' />
      </RadioGroup>
      <Create {...props} title='Clients' redirect='list'>
        <SimpleForm>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              columnGap: '20px',
              width: '80%',
            }}
          >
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
          </div>
        </SimpleForm>
      </Create>
    </BPFormLayout>
  );
};

export default CustomerCreate;
