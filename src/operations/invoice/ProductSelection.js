import { useState, useEffect } from 'react';
import { Box, FormControl, Select, MenuItem, InputLabel, makeStyles } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { ProductItem } from './ProductItem';
import productProvider from '../../providers/product-provider';
import { isIncludesObject } from '../utils/isIncludesObject';
import { CustomButton } from '../utils/CustomButton';

const useStyle = makeStyles(theme => ({
  formControl: {
    minWidth: 300,
    minHeight: 70,
    marginBlock: 7,
  },
}));

export const ProductSelection = ({ name, formValidator }) => {
  const { watch, setValue } = formValidator;
  const [state, setState] = useState({ productsList: [], status: false });
  const selectedProduct = watch(name) || [];
  const classes = useStyle();

  const toggle = () => setState(e => ({ ...e, status: !e.status }));

  const handleProduct = (type, product) => {
    let productTemp = null;
    switch (type) {
      case 'add':
        productTemp = selectedProduct.slice();
        productTemp.push(product);
        toggle();
        break;
      case 'remove':
        productTemp = selectedProduct.filter(e => e.id !== product.id);
        break;
      case 'update':
        productTemp = selectedProduct.map(e => (e.id === product.id ? product : e));
        break;
      default:
        throw new Error('Unknown type');
    }
    setValue(name, productTemp);
  };

  useEffect(() => {
    productProvider.getList().then(data => {
      setState(e => ({ ...e, productsList: data }));
    });
  }, []);

  return (
    <>
      <Box sx={{ width: '100%' }}>
        {selectedProduct &&
          selectedProduct.length > 0 &&
          selectedProduct.map(product => <ProductItem key={product.id} product={product} handleProduct={handleProduct} />)}
      </Box>
      <Box sx={{ width: '100%', marginBottom: 10 }}>
        {!state.status ? (
          <CustomButton onClick={toggle} label='Ajouter un produit' icon={<Add />} />
        ) : (
          <FormControl variant='filled' value='' className={classes.formControl}>
            <InputLabel id='product-selection-id'>Produit</InputLabel>
            <Select id='product-selection-id'>
              {state.productsList.length > 0 &&
                state.productsList
                  .filter(e => !isIncludesObject(selectedProduct, 'id', e.id))
                  .map(e => (
                    <MenuItem onClick={() => handleProduct('add', e)} value={e.id} key={e.id + '2'}>
                      {e.description}
                    </MenuItem>
                  ))}
            </Select>
          </FormControl>
        )}
      </Box>
    </>
  );
};
