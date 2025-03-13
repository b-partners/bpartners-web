import { AccountHolderHandlerWrapper } from '@/security/AccountHolderHandlerWrapper';
import { Box, Dialog } from '@mui/material';
import { AppLocationContext } from '@react-admin/ra-navigation';
import { FC } from 'react';
import { Layout as RaLayout, LayoutProps } from 'react-admin';
import { AppBar } from './appbar';
import { Menu } from './menu';
import { FreeTrialBannerWrapper } from '@/common/components';
import BPErrorPage from '@/common/components/BPErrorPage';
import { useDialog } from '@/common/store/dialog';

export const Layout: FC<LayoutProps> = ({ children, ...layoutProps }) => {
  const { isOpen: isDialogOpen, content: dialogContent, close: closeDialog, dialogProps = {}, backdropClose } = useDialog();
  return (
    <AppLocationContext>
      <AccountHolderHandlerWrapper>
        <RaLayout {...layoutProps} appBar={AppBar} menu={Menu} error={BPErrorPage}>
          <Box sx={{ width: "100%", height: "100%", bgcolor: "#F9FAFB80" }}>
            <FreeTrialBannerWrapper>{children}</FreeTrialBannerWrapper>
          </Box>
        </RaLayout>
        <Dialog open={isDialogOpen} onClose={backdropClose ? closeDialog : undefined} {...dialogProps}>
          {dialogContent}
        </Dialog>
      </AccountHolderHandlerWrapper>
    </AppLocationContext>
  );
};
