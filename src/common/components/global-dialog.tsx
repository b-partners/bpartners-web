import { Dialog } from '@mui/material';
import { useDialog } from '../store/dialog';

export const GlobaDialog = () => {
  const { isOpen: isDialogOpen, content: dialogContent, close: closeDialog, dialogProps = {}, backdropClose } = useDialog();
  return (
    <Dialog open={isDialogOpen} onClose={backdropClose ? closeDialog : undefined} {...dialogProps}>
      {dialogContent}
    </Dialog>
  );
};
