import { create } from 'zustand';
import { TBankDisconnectionStore } from './types';

export const useBankDisconnection = create<TBankDisconnectionStore>()(set => ({
  isInDisconnection: false,
  setIsInDisconnection: isInDisconnection => set({ isInDisconnection }),
}));
