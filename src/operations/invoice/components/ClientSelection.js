import { MenuItem, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import customerProvider from 'src/providers/customer-provider';

export const ClientSelection = props => {
  const { form, name, label, sx } = props;
  const { watch, setValue } = form;
  const [state, setState] = useState({ clients: [], clientSelected: watch(`${name}.name`) || '' });
  const checkError = !watch(name);
  useEffect(() => {
    customerProvider.getList().then(data => setState({ clients: data }));
  }, []);

  const errorProps = checkError && { error: true, helperText: 'Ce champ est requis' };

  return (
    <TextField {...errorProps} select sx={{ width: 300, marginBlock: '3px', ...sx }} label={label} value={watch(`${name}.id`) || ''}>
      {state.clients.length !== 0 ? (
        state.clients.map(client => (
          <MenuItem
            onClick={() => {
              setValue(name, client);
            }}
            key={client.id}
            value={client.id}
          >
            {`${client.lastName} ${client.firstName}` || ''}
          </MenuItem>
        ))
      ) : (
        <div></div>
      )}
    </TextField>
  );
};
