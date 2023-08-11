import { Clear as ClearIcon } from '@mui/icons-material';
import { Card, CardActions, CardContent, CardHeader, IconButton, styled, TextField, Tooltip, tooltipClasses, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { prettyPrintMinors, stringCutter } from '../../../common/utils';
import useGetAccountHolder from '../../../common/hooks/use-get-account-holder';
import { ProductActionType, totalPriceWithoutVatFromProductQuantity, totalPriceWithVatFromProductQuantity, totalVatFromProductQuantity } from '../utils/utils';

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

const CustomTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    fontSize: 11,
    maxWidth: '200px',
    textAlign: 'justify',
    padding: '0.5rem',
    background: '#000000aa',
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
        title={
          <CustomTooltip title={product.description}>
            <Typography sx={{ cursor: 'pointer' }}>{stringCutter(product.description, 20)}</Typography>
          </CustomTooltip>
        }
        subheader={
          prettyPrintMinors(
            companyInfo && companyInfo.isSubjectToVat ? totalPriceWithVatFromProductQuantity(product) : totalPriceWithoutVatFromProductQuantity(product)
          ) + productPriceTTC
        }
        action={
          <IconButton size='small' data-testid={`product-${product.id}-clear`} onClick={() => handleProduct(ProductActionType.REMOVE, product)}>
            <ClearIcon />
          </IconButton>
        }
      />
      {companyInfo && companyInfo.isSubjectToVat && (
        <CardContent>
          <Typography variant='p'>TVA : {prettyPrintMinors(totalVatFromProductQuantity(product))}</Typography>
        </CardContent>
      )}
      <CardActions className={classes.cardActions}>
        <TextField
          value={product.quantity}
          onChange={handleChange}
          sx={{ width: 260 }}
          data-testid={`product-${product.id}-item`}
          type='number'
          label='Nombre du produit'
          InputProps={{
            endAdornment: (
              <Typography sx={{ position: 'relative', top: 10, width: 200 }} variant='body2'>
                X {prettyPrintMinors(product.unitPrice)} (HT)
              </Typography>
            ),
          }}
        />
      </CardActions>
    </Card>
  );
};
