import WorkIcon from '@mui/icons-material/Work';
import ProductCreate from './ProductCreate';
import ProductEdit from './ProductEdit';
import ProductList from './ProductList';

const products = {
  list: ProductList,
  create: ProductCreate,
  edit: ProductEdit,
  icon: WorkIcon,
  options: { label: 'Produits' },
};

export default products;
