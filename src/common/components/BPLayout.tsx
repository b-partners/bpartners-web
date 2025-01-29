import { AccountHolderHandlerWrapper } from '@/security/AccountHolderHandlerWrapper';
import { Dialog } from '@mui/material';
import { AppLocationContext } from '@react-admin/ra-navigation';
import { FC } from 'react';
import { Layout, LayoutProps } from 'react-admin';
import BpMenu from '../../menu/BpMenu';
import { useDialog } from '../store/dialog';
import BPAppBar from './BPAppBar';
import BPErrorPage from './BPErrorPage';
import { FreeTrialBannerWrapper } from './FreeTrialBannerWrapper';

type BPLayoutProps = LayoutProps;

export const BPLayout: FC<BPLayoutProps> = ({ children, ...layoutProps }) => {
  const { isOpen: isDialogOpen, content: dialogContent, close: closeDialog, dialogProps = {}, backdropClose } = useDialog();
  return (
    <AppLocationContext>
      <AccountHolderHandlerWrapper>
        <Layout {...layoutProps} appBar={BPAppBar} menu={BpMenu} error={BPErrorPage}>
          <FreeTrialBannerWrapper>{children}</FreeTrialBannerWrapper>
        </Layout>
        <Dialog open={isDialogOpen} onClose={backdropClose ? closeDialog : undefined} {...dialogProps}>
          {dialogContent}
        </Dialog>
      </AccountHolderHandlerWrapper>
    </AppLocationContext>
  );
};
