import { RadioGroup, Radio, FormControlLabel } from '@mui/material';

const UserTypeRadioGroup = ({ userType, setUserType }) => {
  return (
    <RadioGroup
      style={{ marginLeft: '20px' }}
      aria-labelledby='demo-radio-buttons-group-label'
      name='radio-buttons-group'
      value={userType}
      onChange={e => setUserType(e.target.value)}
      row
    >
      <FormControlLabel data-testid='userType-particulier' value='particulier' control={<Radio />} label='Particulier' />
      <FormControlLabel data-testid='userType-professionnel' value='professionnel' control={<Radio />} label='Professionnel' />
    </RadioGroup>
  );
};

export default UserTypeRadioGroup;
