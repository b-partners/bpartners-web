import { RaMoneyField } from '@/common/components';
import { Edit as EditIcon } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import { FC } from 'react';
import { FunctionField, SimpleShowLayout, TextField } from 'react-admin';
import { AccountHolderIncomeTargets } from './AccountHolderIncomeTargets';
import { SubjectToVatSwitch } from './SubjectToVatSwitch';
import { AccountHolderLayoutProps } from './types';

export const AccountHolderLayout: FC<AccountHolderLayoutProps> = props => {
  const { onEdit } = props;
  const emptyText = 'VIDE';

  return (
    <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
      <IconButton onClick={onEdit} sx={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <EditIcon />
      </IconButton>
      <SimpleShowLayout sx={{ display: 'flex', flexDirection: 'row' }}>
        <TextField pb={3} source='name' emptyText={emptyText} label='Raison sociale' />
        <TextField pb={3} source='businessActivities.primary' emptyText={emptyText} label='Activité principale' />
        <TextField pb={3} source='businessActivities.secondary' emptyText={emptyText} label='Activité secondaire' />
        <TextField pb={3} source='officialActivityName' emptyText={emptyText} label='Activité officielle' />
        <RaMoneyField pb={3} render={data => data?.companyInfo?.socialCapital} label='Capital social' />
        <FunctionField
          pb={3}
          render={record => <AccountHolderIncomeTargets revenueTargets={record.revenueTargets} />}
          label='Encaissement annuelle à réaliser'
        />
        <TextField pb={3} source='siren' label='Siren' />
        <FunctionField pb={3} render={data => <SubjectToVatSwitch data={data} />} label='Micro-entreprise exonérée de TVA' />
      </SimpleShowLayout>
      <SimpleShowLayout sx={{ display: 'flex', flexDirection: 'row' }}>
        <TextField pb={3} source='contactAddress.city' emptyText={emptyText} label='Ville' />
        <TextField pb={3} source='contactAddress.country' emptyText={emptyText} label='Pays' />
        <TextField pb={3} source='contactAddress.address' emptyText={emptyText} label='Adresse' />
        <TextField pb={3} source='contactAddress.postalCode' emptyText={emptyText} label='Code postal' />
        <TextField pb={3} source='companyInfo.townCode' emptyText={emptyText} label='Code de la commune de prospection' />
        <TextField pb={3} source='companyInfo.tvaNumber' emptyText={emptyText} label='Numéro de TVA' />
        <TextField pb={3} source='companyInfo.website' emptyText={emptyText} label='Site Web' />
      </SimpleShowLayout>
    </Box>
  );
};
