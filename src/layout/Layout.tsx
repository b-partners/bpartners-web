import { FreeTrialBannerWrapper, GlobaDialog } from '@/common/components';
import BPErrorPage from '@/common/components/BPErrorPage';
import { useHeartBeat } from '@/common/hooks';
import { AccountHolderHandlerWrapper } from '@/security/AccountHolderHandlerWrapper';
import { AppLocationContext } from '@react-admin/ra-navigation';
import { FC } from 'react';
import { LayoutProps, Layout as RaLayout } from 'react-admin';
import { AppBar } from './appbar';
import { Menu } from './menu';

export const Layout: FC<LayoutProps> = ({ children, ...layoutProps }) => {
  useHeartBeat();

  return (
    <AppLocationContext>
      <AccountHolderHandlerWrapper>
        <RaLayout sx={{ bgcolor: '#F9FAFB0' }} {...layoutProps} appBar={AppBar} menu={Menu} error={BPErrorPage}>
          <FreeTrialBannerWrapper>{children}</FreeTrialBannerWrapper>
        </RaLayout>
        <GlobaDialog />
      </AccountHolderHandlerWrapper>
    </AppLocationContext>
  );
};
