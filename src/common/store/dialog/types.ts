import { DialogProps } from '@mui/material';
import { ReactNode } from 'react';

type TDialogProps = Omit<DialogProps, 'open' | 'close'>;

interface DialogState {
  content: ReactNode;
  isOpen: boolean;
  dialogProps?: TDialogProps;
}

interface DialogAction {
  open: (content: ReactNode, dialogProps?: TDialogProps) => void;
  close: () => void;
}

export type TDialogStore = DialogState & DialogAction;
