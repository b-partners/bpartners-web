import ReceiptIcon from '@mui/icons-material/Receipt';
import CustomerCreate from '../customers/CustomerCreate';
import InvoiceListEditor from './InvoiceListEditor';

const invoice = {
  list: InvoiceListEditor,
  create: CustomerCreate,
  icon: ReceiptIcon,
  options: { label: 'Devis/Facturation' },
};

export default invoice;
