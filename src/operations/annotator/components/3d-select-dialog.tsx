import { useAnnotatorScreenSwitch } from '@/common/store';
import { useDialog } from '@/common/store/dialog';
import { Button, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography } from '@mui/material';
import { useState } from 'react';

export const ThreeDSelectDialog = () => {
  const { setScreen } = useAnnotatorScreenSwitch();
  const [state, setState] = useState<'pan' | 'roof'>('roof');
  const { close } = useDialog();

  const handleGenerate3D = () => {
    setScreen('3d-annotator', state);
    close();
  };

  return (
    <>
      <DialogTitle>
        Mode de génération de la 3d.
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          Générer la modélisation 3D par pan ou sur l'ensemble de l'emprise.
        </Typography>
      </DialogTitle>
      <DialogContent>
        <TextField value={state} sx={{ my: 1 }} label='Mode de génération' fullWidth select>
          <MenuItem onClick={() => setState('pan')} value='pan'>
            Pan
          </MenuItem>
          <MenuItem onClick={() => setState('roof')} value='roof'>
            Emprise
          </MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Annuler</Button>
        <Button onClick={handleGenerate3D}>Générer la 3d</Button>
      </DialogActions>
    </>
  );
};
