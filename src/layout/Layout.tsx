import { FreeTrialBannerWrapper } from '@/common/components';
import BPErrorPage from '@/common/components/BPErrorPage';
import { useHeartBeat } from '@/common/hooks';
import { useDialog } from '@/common/store/dialog';
import { AccountHolderHandlerWrapper } from '@/security/AccountHolderHandlerWrapper';
import { Dialog } from '@mui/material';
import { AppLocationContext } from '@react-admin/ra-navigation';
import { FC } from 'react';
import { LayoutProps, Layout as RaLayout } from 'react-admin';
import { AppBar } from './appbar';
import { Menu } from './menu';

export const Layout: FC<LayoutProps> = ({ children, ...layoutProps }) => {
  const { isOpen: isDialogOpen, content: dialogContent, close: closeDialog, dialogProps = {}, backdropClose } = useDialog();
  useHeartBeat();

  return (
    <AppLocationContext>
      <AccountHolderHandlerWrapper>
        <RaLayout sx={{ bgcolor: '#F9FAFB0' }} {...layoutProps} appBar={AppBar} menu={Menu} error={BPErrorPage}>
          <FreeTrialBannerWrapper>{children}</FreeTrialBannerWrapper>
        </RaLayout>
        <Dialog open={isDialogOpen} onClose={backdropClose ? closeDialog : undefined} {...dialogProps}>
          {dialogContent}
        </Dialog>
      </AccountHolderHandlerWrapper>
    </AppLocationContext>
  );
};
