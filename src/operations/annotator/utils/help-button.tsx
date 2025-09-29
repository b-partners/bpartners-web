import { useDialog } from '@/common/store/dialog';
import { ExpandMore, Help as HelpIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Button, DialogActions, DialogContent, DialogTitle } from '@mui/material';

const AnnotatorHelpDialog = () => {
  const { close } = useDialog();
  return (
    <>
      <DialogTitle>Aide</DialogTitle>
      <DialogContent>
        <Accordion>
          <AccordionSummary sx={{ width: '500px' }} expandIcon={<ExpandMore />}>
            Lancé une analyse automatique
          </AccordionSummary>
          <AccordionDetails>
            Pour pouvoir lancer une analyse automatique, il faut:
            <ul>
              <li>Délimité le toit avec un polygone</li>
              <li>Mettre le label toit au polygone</li>
              <li>Appuyer sur le bouton Analyser la toiture</li>
            </ul>
          </AccordionDetails>
        </Accordion>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Fermer</Button>
      </DialogActions>
    </>
  );
};

export const AnnotatorHelpButton = () => {
  const { open } = useDialog();
  const handleClick = () => open(<AnnotatorHelpDialog />);
  return (
    <Button onClick={handleClick} startIcon={<HelpIcon />}>
      Aide
    </Button>
  );
};
