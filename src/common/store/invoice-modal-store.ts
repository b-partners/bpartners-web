import { Invoice } from 'bpartners-react-client';
import { Dispatch, SetStateAction, createContext, useContext } from 'react';

type ModalType = 'Relaunch' | 'Feedback';

type Modal = {
  isOpen: boolean;
  type: ModalType;
  invoice: Invoice;
};


type ContextType = {
  modal: Modal;
  setModal: Dispatch<SetStateAction<Modal>>;
};


export const InvoiceModalContext = createContext<ContextType | undefined>(undefined);

export const invoiceModalInitialState: Modal = {
  invoice: null,
  isOpen: false,
  type: 'Feedback',
};

export const useInvoiceModalContext = () => {
  const { modal, setModal } = useContext(InvoiceModalContext)

  const closeModal = () => {
    setModal(invoiceModalInitialState)
  }

  const relaunchInvoice = (invoice: Invoice) => {
    setModal({ invoice, isOpen: true, type: "Relaunch" })
  }
  const sendFeedback = (invoice: Invoice) => {
    setModal({ invoice, isOpen: true, type: "Feedback" })
  }

  return {
    modal, closeModal, relaunchInvoice, sendFeedback
  }
};
