import { Typography, Card, CardHeader, CardContent, IconButton, CardActions, FilledInput, FormControl, InputAdornment } from '@mui/material';
import { makeStyles } from '@material-ui/styles';
import { Clear } from '@material-ui/icons';
import { prettyPrintMoney, Currency } from '../utils/money';

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
  const handleChange = event => {
    const newProduct = { ...product };
    newProduct.quantity = parseInt(event.target.value);
    handleProduct('update', newProduct);
  };

  return (
    <Card className={classes.card}>
      <CardHeader
        title={product.description}
        subheader={prettyPrintMoney(product.totalPriceWithVat, Currency.EUR)}
        action={
          <IconButton onClick={() => handleProduct('remove', product)}>
            <Clear />
          </IconButton>
        }
      />
      <CardContent>
        <Typography variant='p'>TVA: {product.totalVat}€</Typography>
      </CardContent>
      <CardActions className={classes.cardActions}>
        <FormControl variant='filled'>
          <FilledInput
            className={classes.filledInput}
            value={isNaN(product.quantity) ? '' : product.quantity === 0 ? 1 : product.quantity}
            onChange={handleChange}
            endAdornment={
              <InputAdornment className={classes.inputAdornment} position='end'>
                X {product.unitPrice}€
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
