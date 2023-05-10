import { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import { Box, Divider, Slider, Stack, Typography } from '@mui/material';
import { accountHoldersGetter, getCachedAccountHolder, updateGlobalInformation } from 'src/providers/account-provider';
import { printError } from 'src/common/utils';

const ProspectsConfiguration = () => {
  const notify = useNotify();
  const {
    contactAddress: { prospectingPerimeter },
  } = getCachedAccountHolder();

  const maxProspectingPerimeter = 10;
  const [newProspectingPerimeter, setNewProspectingPerimeter] = useState(prospectingPerimeter);

  const handleChange = e => {
    const { value } = e.target;
    setNewProspectingPerimeter(value);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (prospectingPerimeter !== newProspectingPerimeter) {
        updateProspectingPerimeter(newProspectingPerimeter).catch(printError);
      }
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newProspectingPerimeter]);

  const updateProspectingPerimeter = async newPerimeter => {
    try {
      const { id, name, officialActivityName, initialCashflow, siren, contactAddress } = await accountHoldersGetter();
      const newGlobalInfo = {
        id: id,
        name: name,
        siren: siren,
        officialActivityName: officialActivityName,
        initialCashFlow: initialCashflow,
        contactAddress: { ...contactAddress, prospectingPerimeter: newPerimeter },
      };

      await updateGlobalInformation(newGlobalInfo);
      notify('Changement enregistré', { type: 'success' });
    } catch (_err) {
      notify('messages.global.error', { type: 'error' });
    }
  };

  return (
    <Box>
      <Typography variant='h6'>Configurer le périmètre de prospection.</Typography>
      <Divider sx={{ mb: 2 }} />
      <Stack spacing={2} direction='row' sx={{ my: 5 }}>
        <Typography variant='body2'>0 km</Typography>
        <Slider
          defaultValue={newProspectingPerimeter}
          aria-label='prospectingPerimeterSlider'
          valueLabelDisplay='on'
          min={0}
          max={maxProspectingPerimeter}
          onChange={handleChange}
          sx={{ width: 300 }}
          data-testid='perimeterSlider'
          value={newProspectingPerimeter}
        />
        <Typography variant='body2'>{maxProspectingPerimeter} km</Typography>
      </Stack>
    </Box>
  );
};

export default ProspectsConfiguration;
