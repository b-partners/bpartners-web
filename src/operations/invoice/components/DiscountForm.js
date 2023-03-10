import { Box, FormControl, Stack, Switch, Typography } from '@mui/material';
import { useState } from 'react';
import BPFormField from 'src/common/components/BPFormField';
import { GLOBAL_DISCOUNT } from '../utils/utils';

const DiscountForm = props => {
  const {
    form: { watch, setValue },
    name,
  } = props;

  const [state, setState] = useState(watch(name));
  const toggleDiscount = () => {
    if (state) {
      setValue(GLOBAL_DISCOUNT, null);
    }
    setState(e => !e);
  };

  return (
    <Box>
      <FormControl>
        <Typography color='text.secondary'>Ajouter une remise :</Typography>
        <Stack direction='row' spacing={1} alignItems='center'>
          <Switch checked={state} onChange={toggleDiscount} />
          <Typography>{!state ? 'Non' : 'Oui'}</Typography>
        </Stack>
      </FormControl>
      {state && <BPFormField type='number' {...props} />}
    </Box>
  );
};

export default DiscountForm;
