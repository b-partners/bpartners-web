import { create } from 'zustand';
import { TDialogStore } from './types';

export const useDialog = create<TDialogStore>()(set => ({
  isOpen: false,
  content: null,
  dialogProps: {},
  close() {
    set({ isOpen: false, content: null });
  },
  open(content, dialogProps) {
    set({ isOpen: true, content, dialogProps });
  },
}));
