import { useToggle } from '@/common/hooks';
import { Alert, Stack } from '@mui/material';

export const Disclaimer = () => {
  const { handleClose, value } = useToggle(true);

  if (!value) return;

  return (
    <Stack direction='row' alignItems='center' justifyContent='center' width='100%'>
      <Alert sx={{ width: '100%', mb: 1 }} onClose={handleClose} variant='filled' color='warning'>
        Disclaimer : rapport généré par IA statistique nécessitant confirmation par votre expert toiture.
      </Alert>
    </Stack>
  );
};
