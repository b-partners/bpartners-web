import { ReactNode } from 'react';

interface DialogState {
  content: ReactNode;
  isOpen: boolean;
}

interface DialogAction {
  open: (content: ReactNode) => void;
  close: () => void;
}

export type TDialogStore = DialogState & DialogAction;
