import { MenuItem, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { customerProvider } from 'src/providers';

export const ClientSelection = props => {
  const { name, label, sx } = props;
  const { setValue } = useFormContext();
  const clientWatch = useWatch({ name });
  const [state, setState] = useState({ clients: [], clientSelected: `${clientWatch?.lastName} ${clientWatch?.firstName}` || '' });
  const checkError = !clientWatch;

  useEffect(() => {
    customerProvider.getList().then(data => setState({ clients: data }));
  }, []);

  const errorProps = checkError && { error: true, helperText: 'Ce champ est requis' };

  return (
    <TextField
      {...errorProps}
      select
      sx={{ width: 300, marginBlock: '3px', ...sx }}
      label={label}
      data-testid='invoice-client-selection'
      value={clientWatch?.id || ''}
    >
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
