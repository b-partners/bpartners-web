import { Add } from '@mui/icons-material';
import { Box, FormHelperText } from '@mui/material';
import { useState } from 'react';
import { BPButton } from '../../../common/components/BPButton';
import { includesObject } from '../../../common/utils';
import { ProductItem } from './ProductItem';
import { ProductActionType, productValidationHandling } from '../utils/utils';
import { INVOICE_EDITION } from '../style';
import { productProvider } from 'src/providers';
import { AutocompleteBackend } from '../../../common/components';
import { AUTOCOMPLETE_LIST_LENGTH } from 'src/constants/invoice';

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

  const fetcher = async q => {
    const data = await productProvider.getList(1, AUTOCOMPLETE_LIST_LENGTH, { descriptionFilter: q, sort: {} });
    return data.filter(e => !includesObject(selectedProduct, 'id', e.id));
  };

  const handleChange = product => {
    if (product && product.description && product.description.length) {
      handleProduct(ProductActionType.ADD, product);
    }
  };

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
        {!state.status > 0 && <BPButton id='invoice-product-selection-button-id' onClick={toggle} label='Ajouter un produit' icon={<Add />} />}
        {state.status && (
          <AutocompleteBackend
            name='invoice-product'
            label='Produits'
            fetcher={fetcher}
            onChange={handleChange}
            getLabel={e => (typeof e === 'string' ? e : e.description)}
            value={{ description: '', id: '' }}
          />
        )}
        {errors[name] && <FormHelperText error={true}>{errors[name].message}</FormHelperText>}
      </Box>
    </>
  );
};
