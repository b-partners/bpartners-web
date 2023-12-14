import { RadioButtonGroupInput, required } from 'react-admin';

const UserTypeRadioGroup = () => {
  return (
    <RadioButtonGroupInput
      source='userType'
      label=''
      choices={[
        { id: 'particulier', name: 'Particulier' },
        { id: 'professionnel', name: 'Professionnel' },
      ]}
      validate={required()}
    />
  );
};

export default UserTypeRadioGroup;
