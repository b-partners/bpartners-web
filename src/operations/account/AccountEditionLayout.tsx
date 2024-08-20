import { IconTipButton } from '@/common/components';
import { Box, Card, CardContent, CardHeader } from '@mui/material';
import { FC } from 'react';
import BusinessActivitiesInputs from './BusinessActivityForm';
import CompanyInformationForm from './CompanyInformationForm';
import { FeedbackLinkForm } from './FeedbackLinkForm';
import GeneralInfoForm from './GeneralInfoForm';
import RevenueTargetForm from './RevenueTargetForm';
import { AccountEditionAccordion, AccountEditionLayoutProps } from './components';

export const AccountEditionLayout: FC<AccountEditionLayoutProps> = ({ onClose }) => {
  return (
    <Card sx={{ border: 'none' }}>
      <CardHeader title='Édition de mon compte' action={<IconTipButton title="Fermé l'édition" icon='Clear' onClick={onClose} />} />
      <CardContent>
        <Box>
          <AccountEditionAccordion title='Information Générale' content={<GeneralInfoForm />} />
          <AccountEditionAccordion title='Boostez votre référencement' content={<FeedbackLinkForm />} />
          <AccountEditionAccordion title='Activité' content={<BusinessActivitiesInputs />} />
          <AccountEditionAccordion title='Informations sur la société' content={<CompanyInformationForm />} />
          <AccountEditionAccordion title='Encaissement annuelle à réaliser' content={<RevenueTargetForm />} />
        </Box>
      </CardContent>
    </Card>
  );
};
