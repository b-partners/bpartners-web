import { Add } from '@mui/icons-material';
import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useState } from 'react';
import { BPButton } from '../../../common/components/BPButton';
import { includesObject } from '../../../common/utils';
import { ProductItem } from './ProductItem';
import { ProductActionType, productValidationHandling } from '../utils/utils';
import { INVOICE_EDITION } from '../style';
import { productProvider } from 'src/providers';

const useStyle = makeStyles(theme => ({
  formControl: {
    width: 300,
    minHeight: 70,
    marginBlock: 7,
  },
  menuItem: {
    width: '100%',
    paddingBlock: 10,
  },
}));

export const ProductSelection = ({ name, form }) => {
  const {
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = form;
  const [state, setState] = useState({ productsList: [], status: false });
  const selectedProduct = watch(name) || [];
  const classes = useStyle();

  const toggle = () => setState(e => ({ ...e, status: !e.status }));

  const handleProduct = (type, product) => {
    let productTemp = null;
    switch (type) {
      case ProductActionType.ADD:
        productTemp = selectedProduct.slice();
        productTemp.push({ ...product, quantity: 1 });
        toggle();
        break;
      case ProductActionType.REMOVE:
        productTemp = selectedProduct.filter(e => e.id !== product.id);
        break;
      case ProductActionType.UPDATE:
        const prodIndex = selectedProduct.findIndex(prod => prod.id === product.id);
        productTemp = selectedProduct;
        productTemp[prodIndex] = product;
        break;
      default:
        throw new Error('Unknown type');
    }
    setValue(name, productTemp);
    productValidationHandling(productTemp, name, setError, clearErrors);
  };

  useEffect(() => {
    productProvider.getList(1, 20, { sort: { field: 'createdAt', order: 'DESC' } }).then(data => {
      setState(e => ({ ...e, productsList: data }));
    });
  }, []);

  const disponibleProducts = state.productsList.filter(e => !includesObject(selectedProduct, 'id', e.id));

  return (
    <>
      {selectedProduct && selectedProduct.length > 0 && (
        <Box sx={INVOICE_EDITION.LONG_LIST}>
          {selectedProduct.map(product => (
            <ProductItem key={product.id} product={product} handleProduct={handleProduct} />
          ))}
        </Box>
      )}
      <Box sx={{ width: '100%' }}>
        {!state.status && state.productsList.filter(e => !includesObject(selectedProduct, 'id', e.id)).length > 0 && (
          <BPButton id='invoice-product-selection-button-id' onClick={toggle} label='Ajouter un produit' icon={<Add />} />
        )}
        {state.status && state.productsList.filter(e => !includesObject(selectedProduct, 'id', e.id)).length > 0 && (
          <FormControl variant='filled' value='' className={classes.formControl}>
            <InputLabel id='product-selection-id'>Produit</InputLabel>
            <Select id='product-selection-id'>
              {disponibleProducts.map(e => (
                <MenuItem className={classes.menuItem} onClick={() => handleProduct(ProductActionType.ADD, e)} value={e.id} key={e.id + '2'}>
                  {e.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {errors[name] && <FormHelperText error={true}>{errors[name].message}</FormHelperText>}
      </Box>
    </>
  );
};
