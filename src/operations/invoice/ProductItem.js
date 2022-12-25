import { Clear } from '@mui/icons-material';
import { Card, CardActions, CardContent, CardHeader, FilledInput, FormControl, IconButton, InputAdornment, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { prettyPrintMinors } from '../utils/money';
import { getVat } from '../utils/vat';
import { getProdTotalPrice, ProductActionType } from './utils';

const useStyle = makeStyles(() => ({
  card: {
    maxWidth: 290,
    padding: 5,
    margin: 5,
  },
  cardActions: {
    width: '100%',
    display: 'flex',
    alignItems: 'end',
  },
  inputAdornment: {
    transform: 'translateY(0.55rem)',
  },
  filledInput: {
    maxWidth: 280,
  },
}));

export const ProductItem = ({ product, handleProduct }) => {
  const classes = useStyle();

  const handleChange = ({ target }) => {
    let localVarProd = { ...product, quantity: parseInt(target.value) };
    const { unitPrice, quantity } = localVarProd;

    const totalVat = getVat(unitPrice * quantity);
    const totalPriceWithVat = getProdTotalPrice({ ...localVarProd, totalVat });

    handleProduct(ProductActionType.UPDATE, { ...localVarProd, totalVat, totalPriceWithVat });
  };

  return (
    <Card className={classes.card}>
      <CardHeader
        title={product.description}
        subheader={prettyPrintMinors(product.totalPriceWithVat) + ' (TTC)'}
        action={
          <IconButton onClick={() => handleProduct(ProductActionType.REMOVE, product)}>
            <Clear />
          </IconButton>
        }
      />
      <CardContent>
        <Typography variant='p'>TVA : {prettyPrintMinors(product.totalVat)}</Typography>
      </CardContent>
      <CardActions className={classes.cardActions}>
        <FormControl variant='filled'>
          <FilledInput
            className={classes.filledInput}
            value={isNaN(product.quantity) ? '' : product.quantity === 0 ? 1 : product.quantity}
            onChange={handleChange}
            data-cy-item='quantity-input'
            endAdornment={
              <InputAdornment className={classes.inputAdornment} position='end'>
                X {prettyPrintMinors(product.unitPrice)} (HT)
              </InputAdornment>
            }
            type='number'
            label='Nombre du produit'
          />
        </FormControl>
      </CardActions>
    </Card>
  );
};
