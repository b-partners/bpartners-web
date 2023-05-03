import { Clear as ClearIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Card, CardContent, CardHeader, IconButton, Tooltip, Typography } from '@mui/material';
import BusinessActivitiesInputs from './BusinessActivityForm';
import CompanyInformationForm from './CompanyInformationForm';
import RevenueTargetForm from './RevenueTargetForm';
import GeneralInfoForm from './GeneralInfoForm';

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
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel0a-content' id='panel0a-header'>
              <Typography variant='h6'>Information Générale</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <GeneralInfoForm />
            </AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded={true} sx={{ mt: 1 }}>
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
              <CompanyInformationForm />
            </AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded={true} sx={{ mt: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel3a-content' id='panel3a-header'>
              <Typography variant='h6'>Recette annuelle à réaliser</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <RevenueTargetForm />
            </AccordionDetails>
          </Accordion>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AccountEditionLayout;
