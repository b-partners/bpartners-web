import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { FC } from 'react';
import { AccountEditionAccordionProps } from './types';

export const AccountEditionAccordion: FC<AccountEditionAccordionProps> = ({ title, content }) => (
  <Accordion defaultExpanded={true}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />} data-testid={`account-${title}-accordion`}>
      <Typography variant='h6'>{title}</Typography>
    </AccordionSummary>
    <AccordionDetails>{content}</AccordionDetails>
  </Accordion>
);
