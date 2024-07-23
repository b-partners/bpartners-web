import { Add } from '@mui/icons-material';
import { Box, FormHelperText } from '@mui/material';
import { CreateInDialogButton } from '@react-admin/ra-form-layout';
import { useState } from 'react';
import { SimpleForm, useNotify } from 'react-admin';
import { AUTOCOMPLETE_LIST_LENGTH } from '@/constants';
import FormProduct from '@/operations/products/components/FormProduct';
import { productProvider } from '@/providers';
import { AutocompleteBackend } from '../../../common/components';
import { BPButton } from '../../../common/components/BPButton';
import { includesObject } from '../../../common/utils';
import { INVOICE_EDITION } from '../style';
import { ProductActionType, productValidationHandling } from '../utils/utils';
import { ProductItem } from './ProductItem';

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
  const notify = useNotify();

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
    const data = await productProvider.getList(1, AUTOCOMPLETE_LIST_LENGTH, { descriptionFilter: q, sort: { field: 'createdAt' } });
    return data.filter(e => !includesObject(selectedProduct, 'id', e.id));
  };

  const handleChange = product => {
    if (product && product.description && product.description.length) {
      handleProduct(ProductActionType.ADD, product);
    }
  };

  const submitNewProduct = async values => {
    // create the new product
    const [createdProductResponse] = await productProvider.saveOrUpdate([values]);
    const adaptedDataNewProduct = {
      ...createdProductResponse,
      unitPrice: createdProductResponse.unitPrice * 100,
      unitPriceWithVat: createdProductResponse.unitPriceWithVat * 100,
      vatPercent: createdProductResponse.vatPercent * 100,
    };
    // add the new created product
    handleProduct('add', adaptedDataNewProduct);
    // notification success
    notify('messages.product.create', { type: 'success' });
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
            label='Rechercher un produit'
            fetcher={fetcher}
            onChange={handleChange}
            getLabel={e => (typeof e === 'string' ? e : e.description)}
            value={{ description: '', id: '' }}
          />
        )}
        {errors[name] && <FormHelperText error={true}>{errors[name].message}</FormHelperText>}
        {state.status && (
          <div style={{ marginBottom: '8px' }} data-testid='create-new-product'>
            <CreateInDialogButton fullWidth title='Créer un nouveau produit' label='Créer un nouveau produit' resource='products'>
              <SimpleForm onSubmit={submitNewProduct}>
                <FormProduct />
              </SimpleForm>
            </CreateInDialogButton>
          </div>
        )}
      </Box>
    </>
  );
};
