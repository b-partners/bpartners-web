import React from 'react';
import { RadioButtonGroupInput } from 'react-admin';

function SexRadioButton() {
  return (
    <RadioButtonGroupInput
      source="Sexe"
      label="Sexe"
      choices={[
        { id: 'M', name: 'Homme' },
        { id: 'F', name: 'Femme' },
      ]}
    />
  );
}

export default SexRadioButton;
