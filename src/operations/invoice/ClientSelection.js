import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useState } from 'react';
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

export const ClientSelection = ({ form, name }) => {
  const { watch, setValue } = form;
  const [state, setState] = useState({ clients: [], clientSelected: watch(`${name}.name`) || '' });
  const classes = useStyle();
  const checkError = !watch(name);
  useEffect(() => {
    customerProvider.getList().then(data => setState({ clients: data }));
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      <FormControl variant='filled' className={classes.formControl} error={checkError}>
        <InputLabel id='client-selection-id'>Client</InputLabel>
        <Select id='invoice-client-selection-id' labelId='client-selection-id' value={watch(`${name}.id`) || ''}>
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
                {`${client.lastName} ${client.firstName}` || ''}
              </MenuItem>
            ))}
        </Select>
        {checkError && <FormHelperText>Ce champ est requis</FormHelperText>}
      </FormControl>
    </Box>
  );
};
