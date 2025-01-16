import TabPanel from '@/common/components/TabPanel';
import { useTabManager } from '@/common/hooks';
import { Box, Tab, Tabs, TabsProps } from '@mui/material';
import { FC, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AccountHolderLayout } from './AccountHolderLayout';
import { SubscriptionLayout } from './SubscriptionLayout';
import { AdditionalInformationProps } from './types';

const ADDITIONAL_INFORMATION_TABS = ['society', 'abonnement'];
export const AdditionalInformation: FC<AdditionalInformationProps> = props => {
  const { onEdit } = props;
  const { tabIndex, handleTabChange } = useTabManager({
    values: ADDITIONAL_INFORMATION_TABS,
  });

  const handleTabChangeWrapper: TabsProps['onChange'] = (_event, newTabIndex) => {
    handleTabChange(newTabIndex);
  };

  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('stripeStatus') === 'done') {
      handleTabChangeWrapper(undefined, 1);
    }
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Tabs value={tabIndex} onChange={handleTabChangeWrapper} variant='fullWidth'>
        <Tab label='Ma société' />
        <Tab data-testid='my-abonnement-tab' label='Mon abonnement' />
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
