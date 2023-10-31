import { Box, Button, Dialog, DialogTitle, DialogActions, DialogContent, Typography } from '@mui/material';
import { useProspectContext } from 'src/common/store/prospect-store';
import { parseRatingLastEvaluation } from '../utils';
import { useEffect, useState } from 'react';
import { prospectingJobsProvider } from 'src/providers';

export const DialogProspectJobDetails = () => {
  const { prospectJobDetails, isOpenPopup, toggleJobDetailsPopup } = useProspectContext();
  const [prospectsLength, setProspectsLength] = useState(0);
  const [prospectsLengthLoading, setprospectsLengthLoading] = useState(true);

  useEffect(() => {
    const getProspectEvaluationJobDetails = async () => {
      const response = await prospectingJobsProvider.getOne(prospectJobDetails?.id);
      setProspectsLength(response?.results.length);
      setprospectsLengthLoading(false);
    };
    getProspectEvaluationJobDetails();
  }, [prospectJobDetails]);

  return (
    <>
      <Dialog open={isOpenPopup} onClose={toggleJobDetailsPopup}>
        <DialogTitle>Détails</DialogTitle>
        <DialogContent>
          <Box>
            {!prospectsLengthLoading && prospectJobDetailsList('Nombre de prospects évalués', prospectsLength)}
            {prospectJobDetailsList('Types intervention', prospectJobDetails?.metadata?.interventionTypes?.replace(/,/g, ', '))}
            {prospectJobDetailsList('Date', parseRatingLastEvaluation(prospectJobDetails?.startedAt))}
            {prospectJobDetailsList("Type d'infestation", prospectJobDetails?.metadata?.infestationType)}
            {prospectJobDetailsList('Profession', prospectJobDetails?.metadata?.profession)}
            {prospectJobDetailsList('SheetName', prospectJobDetails?.metadata?.sheetName)}
            {prospectJobDetailsList('spreadsheetName', prospectJobDetails?.metadata?.spreadsheetName)}
            {prospectJobDetailsList('Nombre min de lignes', prospectJobDetails?.metadata?.min)}
            {prospectJobDetailsList('Nombre max de lignes', prospectJobDetails?.metadata?.max)}
            {prospectJobDetailsList('Note min du client', prospectJobDetails?.metadata?.minCustomerRating)}
            {prospectJobDetailsList('Note min des prospects', prospectJobDetails?.metadata?.minProspectRating)}
            {prospectJobDetailsList('Message', prospectJobDetails?.status?.message)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button data-testid='close-dialog-prospectJob-id' onClick={toggleJobDetailsPopup}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const prospectJobDetailsList = (label, value) => {
  return (
    <Typography variant='body2'>
      {label} :{' '}
      <Typography component='span' fontWeight={'bold'}>
        {value}
      </Typography>
    </Typography>
  );
};
