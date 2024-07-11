import { RadioButtonGroupInput, required } from 'react-admin';

const CustomerTypeRadioGroup = () => {
  return (
    <RadioButtonGroupInput
      source='customerType'
      label=''
      choices={[
        { id: 'INDIVIDUAL', name: 'Particulier' },
        { id: 'PROFESSIONAL', name: 'Professionnel' },
      ]}
      validate={required()}
    />
  );
};

export default CustomerTypeRadioGroup;
