import { Clear as ClearIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Card, CardContent, CardHeader, IconButton, Tooltip, Typography } from '@mui/material';
import BusinessActivitiesInputs from './BusinessActivityForm';
import CompanyInformationForm from './CompanyInformationForm';
import RevenueTargetForm from './RevenueTargetForm';
import GeneralInfoForm from './GeneralInfoForm';
import { FeedbackLinkForm } from './FeedbackLinkForm';

const CloseConfigurationButton = ({ onClick }) => (
  <Tooltip title="Fermé l'édition">
    <IconButton onClick={onClick}>
      <ClearIcon />
    </IconButton>
  </Tooltip>
);

const CustomAccordion = ({ render, title }) => {
  return (
    <Accordion defaultExpanded={true}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} data-testid={`account-${title}-accordion`}>
        <Typography variant='h6'>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>{render}</AccordionDetails>
    </Accordion>
  );
};

const AccountEditionLayout = ({ onClose }) => {
  return (
    <Card sx={{ border: 'none' }}>
      <CardHeader title='Édition de mon compte' action={<CloseConfigurationButton onClick={onClose} />} />
      <CardContent>
        <Box>
          <CustomAccordion title='Information Générale' render={<GeneralInfoForm />} />
          <CustomAccordion title='Boostez votre référencement' render={<FeedbackLinkForm />} />
          <CustomAccordion title='Activité' render={<BusinessActivitiesInputs />} />
          <CustomAccordion title='Informations sur la société' render={<CompanyInformationForm />} />
          <CustomAccordion title='Encaissement annuelle à réaliser' render={<RevenueTargetForm />} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default AccountEditionLayout;
