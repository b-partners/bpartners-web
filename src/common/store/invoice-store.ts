import { Invoice } from 'bpartners-react-client';
import { createContext, Dispatch } from 'react';

export type InvoiceView = 'list' | 'edition' | 'creation' | 'preview';
export type ReducerAction = 'setInvoice' | 'setTab' | 'setPending' | 'setDocumentUrl' | 'setView' | 'set' | 'setModale';

export type InvoiceTab = 'draft' | 'proposal' | 'confirmed';

export type InvoiceModal = {
  type: 'Feedback' | 'Relaunch';
  isOpen: boolean;
};

export type InvoiceContextState = {
  invoice: Invoice;
  tab: InvoiceTab;
  updatePendingNumbers: number;
  view: InvoiceView;
  documentUrl: string;
  modal: InvoiceModal;
};

type Action = {
  type: ReducerAction;
  payload: any;
};

type ContextType = {
  state: InvoiceContextState;
  dispatch: Dispatch<Action>;
};

export const InvoiceListContext = createContext<ContextType | undefined>(undefined);

export const invoiceReducer = (state: InvoiceContextState, { type, payload }: Action) => {
  switch (type) {
    case 'setInvoice':
      return { ...state, invoice: payload };
    case 'setDocumentUrl':
      return { ...state, documentUrl: payload };
    case 'setTab':
      return { ...state, tab: payload };
    case 'setPending':
      return { ...state, updatePendingNumbers: payload };
    case 'setView':
      return { ...state, view: payload };
    case 'setModale':
      return { ...state, modal: payload.modal, invoice: payload.invoice };
    case 'set':
      return { ...state, ...payload };
  }
};

// const invoiceListReducer = (state, { type, payload }) => {
//   switch (type) {
//     case InvoiceActionType.START_PENDING:
//       return {
//         ...state,
//         nbPendingInvoiceCrupdate: state.nbPendingInvoiceCrupdate + 1,
//         documentUrl: payload.documentUrl,
//       };
//     case InvoiceActionType.STOP_PENDING:
//       return {
//         ...state,
//         nbPendingInvoiceCrupdate: state.nbPendingInvoiceCrupdate - 1,
//         documentUrl: payload.documentUrl,
//       };
//     case InvoiceActionType.SET:
//       return { ...state, ...payload };
//     default:
//       throw new Error('Unknown action type');
//   }
// };
