import { DialogProps } from '@mui/material';
import { ReactNode } from 'react';

type TDialogProps = Omit<DialogProps, 'open' | 'close'>;

interface DialogState {
  content: ReactNode;
  isOpen: boolean;
  dialogProps?: TDialogProps;
  backdropClose?: boolean;
}

interface DialogAction {
  open: (content: ReactNode, dialogProps?: TDialogProps, backdropClose?: boolean) => void;
  close: () => void;
}

export type TDialogStore = DialogState & DialogAction;
