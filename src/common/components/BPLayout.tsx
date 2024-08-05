import { Dialog } from '@mui/material';
import { AppLocationContext } from '@react-admin/ra-navigation';
import { FC } from 'react';
import { Layout, LayoutProps } from 'react-admin';
import BpMenu from '../../menu/BpMenu';
import { useDialog } from '../store/dialog';
import BPAppBar from './BPAppBar';
import BPErrorPage from './BPErrorPage';

type BPLayoutProps = LayoutProps;

export const BPLayout: FC<BPLayoutProps> = props => {
  const { isOpen: isDialogOpen, content: dialogContent, close: closeDialog } = useDialog();

  return (
    <AppLocationContext>
      <Layout {...props} appBar={BPAppBar} menu={BpMenu} error={BPErrorPage} />
      <Dialog open={isDialogOpen} onClose={closeDialog}>
        {dialogContent}
      </Dialog>
    </AppLocationContext>
  );
};
