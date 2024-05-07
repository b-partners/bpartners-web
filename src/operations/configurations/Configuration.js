import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import FrequencyConfig from './FrequencyConfig';

const CustomAccordion = ({ content, title }) => {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary data-testid={`${title}-configuration-accordion`} expandIcon={<ExpandMoreIcon />}>
        <Typography variant='h6'>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>{content}</AccordionDetails>
    </Accordion>
  );
};

export const Configuration = () => {
  return (
    <div>
      <CustomAccordion title='Fréquence de relance' content={<FrequencyConfig />} />
    </div>
  );
};
