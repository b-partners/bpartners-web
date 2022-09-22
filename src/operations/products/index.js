import WorkIcon from '@material-ui/icons/Work';
import ProductCreate from './ProductCreate';
import ProductList from './ProductList';

const products = {
  list: ProductList,
  create: ProductCreate,
  icon: WorkIcon,
  options: { label: 'Produits' },
};

export default products;