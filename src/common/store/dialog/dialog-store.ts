import { create } from 'zustand';
import { TDialogStore } from './types';

export const useDialog = create<TDialogStore>()(set => ({
  isOpen: false,
  content: null,
  dialogProps: {},
  backdropClose: false,
  close() {
    set({ isOpen: false, content: null });
  },
  open(content, dialogProps, backdropClose = true) {
    set({ isOpen: true, content, dialogProps, backdropClose });
  },
}));
