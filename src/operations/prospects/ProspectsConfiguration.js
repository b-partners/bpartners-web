import { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import { Box, Divider, Slider, Stack, Typography, Button, Grid, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { printError } from 'src/common/utils';
import { getCached } from 'src/providers/cache';
import { accountHolderProvider, updateGlobalInformation } from '../../providers';
import { DialogGoogleSheetConsent } from './components/DialogGoogleSheetConsent';
import FormEvaluateProspects from './components/FormEvaluateProspects';
import EvaluatedProspectColumn from './components/EvaluatedProspectColumn';
import { useProspectContext } from 'src/common/store/prospect-store';
import { DialogProspectJobDetails } from './components/DialogProspectJobDetails';

const ProspectsConfiguration = () => {
  const notify = useNotify();
  const {
    contactAddress: { prospectingPerimeter },
  } = getCached.accountHolder();

  const maxProspectingPerimeter = 10;
  const [newProspectingPerimeter, setNewProspectingPerimeter] = useState(prospectingPerimeter);
  const [isOpen, setIsOpen] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const BP_USER = JSON.parse(localStorage.getItem('bp_user'));
  const { getProspectingJobs, evaluatedProspectsList, refreshLoading, isOpenPopup } = useProspectContext();
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
      const { id, name, officialActivityName, initialCashflow, siren, contactAddress } = await accountHolderProvider.getOne();
      const newGlobalInfo = {
        id: id,
        name: name,
        siren: siren,
        officialActivityName: officialActivityName,
        initialCashFlow: initialCashflow,
        contactAddress: { ...contactAddress, prospectingPerimeter: newPerimeter },
      };

      await updateGlobalInformation(newGlobalInfo);
      notify('messages.global.changesSaved', { type: 'success' });
    } catch (_err) {
      notify('messages.global.error', { type: 'error' });
    }
  };

  const handleDialog = value => {
    setIsOpen(value);
  };

  useEffect(() => {
    setTokenValid(isExhalationPassed());
  }, []);

  const isExhalationPassed = () => {
    const expirationTime = localStorage.getItem('expiredAt_validationToken_googleSheet');
    const currentTime = new Date();
    const expirationDate = new Date(expirationTime);
    return currentTime < expirationDate;
  };

  useEffect(() => {
    tokenValid && getProspectingJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenValid]);

  const filterDataByStatus = (data, status) => {
    return data.filter(item => item.status.value === status);
  };

  return (
    <>
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
        {BP_USER.roles[0] === 'EVAL_PROSPECT' ? (
          <>
            <Typography variant='h6'>Évaluation des prospects</Typography>
            <Divider sx={{ mb: 2 }} />
            {tokenValid ? (
              <>
                <FormEvaluateProspects />

                <Box sx={{ display: 'flex', flexDirection: 'row-reverse' }}>
                  <Button onClick={getProspectingJobs} disabled={refreshLoading} startIcon={refreshLoading && <CircularProgress color='inherit' size={18} />}>
                    Rafraîchir la liste <RefreshIcon />
                  </Button>
                </Box>
                <Divider sx={{ mt: 3 }} />
                <Grid sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', columnGap: '10px' }}>
                  <EvaluatedProspectColumn title='En attente' data={filterDataByStatus(evaluatedProspectsList, 'NOT_STARTED')} color='#00000061' />
                  <EvaluatedProspectColumn title='Traitement' data={filterDataByStatus(evaluatedProspectsList, 'IN_PROGRESS')} color='#005ce6' />
                  <EvaluatedProspectColumn title='Réussi' data={filterDataByStatus(evaluatedProspectsList, 'FINISHED')} color='#00cc33' />
                  <EvaluatedProspectColumn title='Échoué' data={filterDataByStatus(evaluatedProspectsList, 'FAILED')} color='#FA113D' />
                </Grid>
              </>
            ) : (
              <Button onClick={() => handleDialog(true)} data-cy='evaluate-prospect'>
                Évaluer les prospects
              </Button>
            )}
          </>
        ) : null}
      </Box>

      {isOpen ? <DialogGoogleSheetConsent isOpen={isOpen} handleDialog={handleDialog} /> : null}
      {isOpenPopup ? <DialogProspectJobDetails /> : null}
    </>
  );
};

export default ProspectsConfiguration;
