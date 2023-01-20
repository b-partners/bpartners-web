import { Clear as ClearIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Card, CardContent, CardHeader, IconButton, Tooltip, Typography } from '@mui/material';
import BusinessActivitiesInputs from './BusinessActivityForm';
import CompanyInfomationForm from './CompanyInformationForm';

const CloseConfigurationButton = ({ onClick }) => (
  <Tooltip title="Fermé l'édition">
    <IconButton onClick={onClick}>
      <ClearIcon />
    </IconButton>
  </Tooltip>
);

const AccountEditionLayout = ({ onClose }) => {
  return (
    <Card sx={{ border: 'none' }}>
      <CardHeader title='Édition de mon compte' action={<CloseConfigurationButton onClick={onClose} />} />
      <CardContent>
        <Box>
          <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel1a-content' id='panel1a-header'>
              <Typography variant='h6'>Activité</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <BusinessActivitiesInputs />
            </AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded={true} sx={{ mt: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel2a-content' id='panel2a-header'>
              <Typography variant='h6'>Information sur la société</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <CompanyInfomationForm />
            </AccordionDetails>
          </Accordion>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AccountEditionLayout;
