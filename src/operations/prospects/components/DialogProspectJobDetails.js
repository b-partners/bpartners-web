import { Box, Button, Dialog, DialogTitle, DialogActions, DialogContent, Typography } from '@mui/material';
import { useProspectContext } from 'src/common/store/prospect-store';
import { parseRatingLastEvaluation } from '../utils';

export const DialogProspectJobDetails = () => {
  const { prospectJobDetails, isOpenPopup, handlePopup_prospectJobDetails } = useProspectContext();

  return (
    <>
      <Dialog open={isOpenPopup} onClose={handlePopup_prospectJobDetails}>
        <DialogTitle>Détails</DialogTitle>
        <DialogContent>
          <Box>
            {prospectJobDetailsList('Types intervention', prospectJobDetails?.metadata?.interventionTypes?.replace(/,/g, ', '))}
            {prospectJobDetailsList('Date', parseRatingLastEvaluation(prospectJobDetails?.startedAt))}
            {prospectJobDetailsList("Type d'infestation", prospectJobDetails?.metadata?.infestationType)}
            {prospectJobDetailsList('Profession', prospectJobDetails?.metadata?.profession)}
            {prospectJobDetailsList('SheetName', prospectJobDetails?.metadata?.sheetName)}
            {prospectJobDetailsList('SpreedSheetName', prospectJobDetails?.metadata?.spreedSheetName)}
            {prospectJobDetailsList('Nombre min de lignes', prospectJobDetails?.metadata?.min)}
            {prospectJobDetailsList('Nombre max de lignes', prospectJobDetails?.metadata?.max)}
            {prospectJobDetailsList('Note min du client', prospectJobDetails?.metadata?.minCustomerRating)}
            {prospectJobDetailsList('Note min des prospects', prospectJobDetails?.metadata?.minProspectRating)}
            {prospectJobDetailsList('Message', prospectJobDetails?.status?.message)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button data-testid='close-dialog-prospectJob-id' onClick={handlePopup_prospectJobDetails}>
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
