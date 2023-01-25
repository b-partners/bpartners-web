import { Clear } from '@mui/icons-material';
import { Card, CardActions, CardContent, CardHeader, FilledInput, FormControl, IconButton, InputAdornment, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { prettyPrintMinors } from '../utils/money';
import useGetAccountHolder from '../utils/useGetAccountHolder';
import { ProductActionType, totalPriceWithVatFromProductQuantity, totalVatFromProductQuantity } from './utils';

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
  const handleChange = ({ target }) => {
    let localVarProd = { ...product, quantity: parseInt(target.value) };
    handleProduct(ProductActionType.UPDATE, { ...localVarProd });
  };

  const { companyInfo } = useGetAccountHolder();
  const productPriceTTC = companyInfo && companyInfo.isSubjectToVat ? ' (TTC)' : '';

  const classes = useStyle();

  return (
    <Card className={classes.card}>
      <CardHeader
        title={product.description}
        subheader={prettyPrintMinors(totalPriceWithVatFromProductQuantity(product)) + productPriceTTC}
        action={
          <IconButton onClick={() => handleProduct(ProductActionType.REMOVE, product)}>
            <Clear />
          </IconButton>
        }
      />
      {companyInfo && companyInfo.isSubjectToVat && (
        <CardContent>
          <Typography variant='p'>TVA : {prettyPrintMinors(totalVatFromProductQuantity(product))}</Typography>
        </CardContent>
      )}
      <CardActions className={classes.cardActions}>
        <FormControl variant='filled'>
          <FilledInput
            className={classes.filledInput}
            value={product.quantity}
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
