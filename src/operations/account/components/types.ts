import { ReactNode } from 'react';

export interface AccountEditionAccordionProps {
  title: string;
  content?: ReactNode;
}

export interface AccountEditionLayoutProps {
  onClose: () => void;
}
