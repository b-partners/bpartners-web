import { Button, Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText } from '@mui/material';
import { useNotify } from 'react-admin';
import { redirect } from 'src/common/utils';
import { SheetProvider } from 'src/providers/sheet-provider';

export const DialogGoogleSheetConsent = props => {
  const { isOpen, handleDialog } = props;
  const notify = useNotify();

  const handleClickAutorization = async () => {
    try {
      const response = await SheetProvider.oauth2Init();
      console.log('response', response);
      if (response) {
        redirect(response.redirectionUrl);
      }
    } catch (error) {
      notify('Une erreur est survenue au moment de la redirection.', { type: 'warning' });
    }
  };

  return (
    <Dialog open={isOpen} onClose={() => handleDialog(false)}>
      <DialogTitle>Connexion à Google Sheets requise</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>Vous devez vous connecter à Google sheets pour évaluer les prospects</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button data-testid='close-dialog-id' onClick={() => handleDialog(false)}>
          Annuler
        </Button>
        <Button data-testid='connect-to-googleSheets' onClick={handleClickAutorization}>
          Se connecter à Google Sheets
        </Button>
      </DialogActions>
    </Dialog>
  );
};
