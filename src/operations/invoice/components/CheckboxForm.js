import { Box, FormControl, FormControlLabel, Checkbox } from '@mui/material';
import { useEffect, useState } from 'react';
import BPFormField from 'src/common/components/BPFormField';

const CheckboxForm = props => {
  const {
    form: { watch, setValue },
    name,
    switchLabel,
    source,
  } = props;
  const [state, setState] = useState(false);

  const isChecked = watch(name) !== null;

  useEffect(() => {
    setState(isChecked);
  }, [isChecked]);

  const handleToggle = (_event, isChecked) => {
    if (state) {
      setValue(source || name, null);
    }
    setState(isChecked);
  };

  return (
    <Box>
      <FormControl>
        <FormControlLabel control={<Checkbox data-testid={`${name}-checkbox-id`} checked={state} onChange={handleToggle} />} label={switchLabel} />
      </FormControl>
      {state && <BPFormField shouldValidate={false} {...props} />}
    </Box>
  );
};

export default CheckboxForm;
