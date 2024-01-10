import { Invoice } from '@bpartners/typescript-client';
import { createContext, useContext } from 'react';

type ConversionStore = {
  invoice: Invoice;
};

export const ConversionContext = createContext<ConversionStore | undefined>(undefined);

export const useGetConversionContext = () => {
  const state = useContext(ConversionContext);
  return state;
};
