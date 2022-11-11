import { useState, useEffect } from 'react';
import { Box, Select, MenuItem, InputLabel, FormControl, FormHelperText } from '@mui/material';
import { makeStyles } from '@material-ui/core/styles';
import { customerProvider } from '../../providers/customer-provider';

const useStyle = makeStyles(() => ({
  formControl: {
    width: 300,
    minHeight: 70,
    marginTop: 3,
    marginBottom: 7,
    marginLeft: 2,
  },
  menuItem: {
    width: '100%',
    paddingBlock: 10,
  },
}));

export const ClientSelection = ({ formValidator, name }) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = formValidator;
  const [state, setState] = useState({ clients: [], clientSelected: watch(`${name}.name`) || '' });
  const classes = useStyle();
  const customRegister = register(`${name}.name`, { required: true });
  customRegister.onchange = undefined;

  useEffect(() => {
    customerProvider.getList().then(data => setState({ clients: data }));
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      <FormControl variant='filled' className={classes.formControl} error={errors[name]}>
        <InputLabel id='client-selection-id'>Client</InputLabel>
        <Select id='invoice-client-selection-id' labelId='client-selection-id' value={watch(`${name}.id`) || ''} {...customRegister}>
          {state.clients.length !== 0 &&
            state.clients.map(client => (
              <MenuItem
                onClick={() => {
                  setValue(name, client);
                }}
                key={client.id}
                value={client.id}
                className={classes.menuItem}
              >
                {client.name || ''}
              </MenuItem>
            ))}
        </Select>
        {errors[name] && <FormHelperText>Ce champ set requis</FormHelperText>}
      </FormControl>
    </Box>
  );
};
