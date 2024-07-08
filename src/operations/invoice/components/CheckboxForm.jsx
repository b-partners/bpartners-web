import { Box, Checkbox, FormControl, FormControlLabel } from '@mui/material';
import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { BpFormField } from 'src/common/components';

const CheckboxForm = props => {
  const { setValue } = useFormContext();
  const { children, name, switchlabel, source } = props;
  const [state, setState] = useState(false);
  const record = useWatch({ name: name || source });

  const isChecked = record !== null;

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
        <FormControlLabel control={<Checkbox data-testid={`${name || source}-checkbox-id`} checked={state} onChange={handleToggle} />} label={switchlabel} />
      </FormControl>
      {state && (children ? children : <BpFormField shouldValidate={false} {...props} />)}
    </Box>
  );
};

export default CheckboxForm;
