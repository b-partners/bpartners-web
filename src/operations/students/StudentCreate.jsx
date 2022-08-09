import {
  Create, SimpleForm, TextInput, DateTimeInput, DateInput,
} from 'react-admin';
import SexRadioButton from '../utils/SexRadioButton';
import React from 'react';

function StudentCreate(props) {
  return (
    <Create {...props} title="Étudiants">
      <SimpleForm>
        <TextInput source="ref" label="Référence" fullWidth />
        <TextInput source="first_name" label="Prénoms" fullWidth />
        <TextInput source="last_name" label="Nom" fullWidth />
        <SexRadioButton />
        <TextInput source="phone" label="Téléphone" fullWidth />
        <DateInput source="birth_date" label="Date de naissance" fullWidth />
        <TextInput source="address" label="Adresse" fullWidth multiline />
        <TextInput source="email" label="Email" fullWidth />
        <DateTimeInput source="entrance_datetime" label="Date d'entrée chez HEI" fullWidth />
      </SimpleForm>
    </Create>
  );
}

export default StudentCreate;
