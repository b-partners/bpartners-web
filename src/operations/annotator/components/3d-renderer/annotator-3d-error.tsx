import { CityJSONRequestStatus } from '@/providers/city-json-provider';
import { WarningOutlined } from '@mui/icons-material';
import { Alert } from '@mui/material';
import { FC, useMemo } from 'react';

export const Annotator3DErrorUI: FC<{ error: Error }> = ({ error }) => {
  const { errorMessage, status } = useMemo(() => {
    let result = {
      errorMessage: 'Une erreur est survenue lors de la génération de la version 3D de votre maison.',
      status: CityJSONRequestStatus.FAILED,
    };

    if (error.message.includes(CityJSONRequestStatus.UNAVAILABLE)) {
      result = {
        errorMessage: 'La version 3D de la maison est actuellement indisponible, mais sera disponible prochainement.',
        status: CityJSONRequestStatus.UNAVAILABLE,
      };
    }

    return result;
  }, [error?.message]);

  return (
    <Alert data-testid='3D-error-alert' sx={{ mt: 2 }} icon={<WarningOutlined />} severity={status === CityJSONRequestStatus.UNAVAILABLE ? 'warning' : 'error'}>
      {errorMessage}
    </Alert>
  );
};
