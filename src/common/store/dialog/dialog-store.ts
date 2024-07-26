import { create } from 'zustand';
import { TDialogStore } from './types';

export const useDialog = create<TDialogStore>()(set => ({
  isOpen: false,
  content: null,
  close() {
    set({ isOpen: false, content: null });
  },
  open(content) {
    set({ isOpen: true, content });
  },
}));
