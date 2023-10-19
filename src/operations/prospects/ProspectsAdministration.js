import { useState, useEffect } from 'react';
import { Box, Divider, Typography, Button, Grid, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FormEvaluateProspects from './components/FormEvaluateProspects';
import EvaluatedProspectColumn from './components/EvaluatedProspectColumn';
import { useProspectContext } from 'src/common/store/prospect-store';
import { DialogGoogleSheetConsent } from './components/DialogGoogleSheetConsent';
import { DialogProspectJobDetails } from './components/DialogProspectJobDetails';

const ProspectsAdministration = () => {
  const { getProspectingJobs, evaluatedProspectsList, refreshLoading, isOpenPopup } = useProspectContext();
  const [tokenValid, setTokenValid] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    tokenValid && getProspectingJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenValid]);

  useEffect(() => {
    setTokenValid(isExhalationPassed());
  }, []);

  const isExhalationPassed = () => {
    const expirationTime = localStorage.getItem('expiredAt_validationToken_googleSheet');
    const currentTime = new Date();
    const expirationDate = new Date(expirationTime);
    return currentTime < expirationDate;
  };
  const filterDataByStatus = (data, status) => {
    return data.filter(item => item.status.value === status);
  };

  const handleDialog = value => {
    setIsOpen(value);
  };
  return (
    <Box>
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
      {isOpen ? <DialogGoogleSheetConsent isOpen={isOpen} handleDialog={handleDialog} /> : null}
      {isOpenPopup ? <DialogProspectJobDetails /> : null}
    </Box>
  );
};

export default ProspectsAdministration;
