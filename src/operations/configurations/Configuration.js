import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@material-ui/core';
import FrequencyConfig from './FrequencyConfig';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

export const Configuration = () => {
  return (
    <div>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel1a-content' id='panel1a-header'>
          <Typography variant='h6'>Frequence de relance</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FrequencyConfig />
        </AccordionDetails>
      </Accordion>
    </div>
  );
};
