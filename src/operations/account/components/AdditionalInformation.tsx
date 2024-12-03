import TabPanel from '@/common/components/TabPanel';
import { Box, Tab, Tabs, TabsProps } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AccountHolderLayout } from './AccountHolderLayout';
import { SubscriptionLayout } from './SubscriptionLayout';
import { AdditionalInformationProps } from './types';

export const AdditionalInformation: FC<AdditionalInformationProps> = props => {
  const { onEdit } = props;
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange: TabsProps['onChange'] = (_event, newTabIndex) => {
    setTabIndex(newTabIndex);
  };

  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('stripeStatus') === 'done') {
      handleTabChange(undefined, 1);
    }
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Tabs value={tabIndex} onChange={handleTabChange} variant='fullWidth'>
        <Tab label='Ma société' />
        <Tab label='Mon abonnement' />
      </Tabs>

      <TabPanel value={tabIndex} index={0} sx={{ p: 3 }}>
        <AccountHolderLayout onEdit={onEdit} />
      </TabPanel>

      <TabPanel value={tabIndex} index={1} sx={{ p: 3 }}>
        <SubscriptionLayout />
      </TabPanel>
    </Box>
  );
};
