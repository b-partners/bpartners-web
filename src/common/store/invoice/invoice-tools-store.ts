import { Invoice, InvoiceStatus } from 'bpartners-react-client';
import { Dispatch, SetStateAction, createContext, useContext } from 'react';

type ModalType = 'FEEDBACK' | 'RELAUNCH';

type Tab = 0 | 1 | 2;

export type View = 'list' | 'edition' | 'creation' | 'preview';

type Modal = {
  type: ModalType;
  isOpen: boolean;
  invoice: Invoice;
};

export type InvoiceToolState = {
  tab: Tab;
  modal: Modal;
  view: View;
};

export type InvoiceTool = InvoiceToolState & {
  setState: Dispatch<SetStateAction<InvoiceToolState>>;
};

export const InvoiceToolContext = createContext<InvoiceTool | undefined>(undefined);

const getTabByStatus = (status: InvoiceStatus) => {
  switch (status) {
    case 'DRAFT':
      return 0;
    case 'PROPOSAL':
      return 1;
    default:
      return 2;
  }
};

export const useInvoiceToolContext = () => {
  const { setState, ...state } = useContext(InvoiceToolContext);

  const openModal = (modal: Modal) => setState(state => ({ ...state, modal }));
  const closeModal = () => setState(state => ({ ...state, modal: { isOpen: false, type: 'FEEDBACK', invoice: null } }));
  const setTab = (_event: React.SyntheticEvent<Element, Event>, tab: Tab) => setState(state => ({ ...state, tab }));
  const setView = (view: View) => setState(state => ({ ...state, view }));
  const returnToListByStatus = (status: InvoiceStatus) => setState(state => ({ ...state, view: 'list', tab: getTabByStatus(status) }));

  return { ...state, openModal, closeModal, setTab, setView, returnToListByStatus };
};
