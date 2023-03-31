import { Box, FormControl, FormControlLabel, Checkbox } from '@mui/material';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { BpFormField } from 'src/common/components';

const CheckboxForm = props => {
  const { watch, setValue } = useFormContext();
  const { children, name, switchlabel, source } = props;
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
        <FormControlLabel control={<Checkbox data-testid={`${name}-checkbox-id`} checked={state} onChange={handleToggle} />} label={switchlabel} />
      </FormControl>
      {state && (children ? children : <BpFormField shouldValidate={false} {...props} />)}
    </Box>
  );
};

export default CheckboxForm;
