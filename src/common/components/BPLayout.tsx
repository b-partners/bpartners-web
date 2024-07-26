import { Dialog } from '@mui/material';
import { Layout } from '@react-admin/ra-enterprise';
import { AppLocationContext } from '@react-admin/ra-navigation';
import { FC } from 'react';
import BpMenu from '../../menu/BpMenu';
import { useDialog } from '../store/dialog';
import BPAppBar from './BPAppBar';
import BPErrorPage from './BPErrorPage';

type BPLayoutProps = Record<string, any>;

export const BPLayout: FC<BPLayoutProps> = props => {
  const { isOpen: isDialogOpen, content: dialogContent, close: closeDialog } = useDialog();

  return (
    <AppLocationContext>
      <Layout {...props} appBar={BPAppBar} menu={BpMenu} error={BPErrorPage} breadcrumb={<></>} />
      <Dialog open={isDialogOpen} onClose={closeDialog}>
        {dialogContent}
      </Dialog>
    </AppLocationContext>
  );
};
