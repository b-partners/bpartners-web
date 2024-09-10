import { BpFormField } from '@/common/components';
import { BpFormFieldProps } from '@/common/components/types';
import { Box, Checkbox, FormControl, FormControlLabel } from '@mui/material';
import { ChangeEvent, FC, ReactNode, useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

const CheckboxForm: FC<{ children: ReactNode; name: string; switchlabel: string; source: string } & Partial<BpFormFieldProps>> = props => {
  const { setValue } = useFormContext();
  const { children, name, switchlabel, source } = props;
  const [state, setState] = useState(false);
  const record = useWatch({ name: name || source });

  const isChecked = record !== null;

  useEffect(() => {
    setState(isChecked);
  }, [isChecked]);

  const handleToggle = (_event: ChangeEvent<HTMLInputElement>, isChecked: boolean) => {
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
      {state && (children ? children : <BpFormField shouldValidate={false} {...(props as BpFormFieldProps)} />)}
    </Box>
  );
};

export default CheckboxForm;
