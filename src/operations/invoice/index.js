import ReceiptIcon from '@mui/icons-material/Receipt';
import InvoiceListEditor from './InvoiceListEditor';
import CustomerCreate from '../customers/CustomerCreate';

const invoice = {
  list: InvoiceListEditor,
  create: CustomerCreate,
  icon: ReceiptIcon,
  options: { label: 'Devis/Facturation' },
};

export default invoice;
