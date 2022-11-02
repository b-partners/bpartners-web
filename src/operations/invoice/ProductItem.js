import { Typography, TextField, Card, CardHeader, CardContent, IconButton, CardActions } from '@mui/material';
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
        <Typography variant='p'>TVA: {product.totalVatPercent}€</Typography>
      </CardContent>
      <CardActions className={classes.cardActions}>
        <TextField
          value={isNaN(product.quantity) ? '' : product.quantity === 0 ? 1 : product.quantity}
          onChange={handleChange}
          type='number'
          label='Nombre du produit'
        />
        <Typography variant='p'>* {product.unitPrice}€</Typography>
      </CardActions>
    </Card>
  );
};
