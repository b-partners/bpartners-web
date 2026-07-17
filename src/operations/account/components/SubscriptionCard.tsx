import { useToggle } from '@/common/hooks';
import { InvoiceExportFilters, InvoiceExportModal } from '@/operations/invoice/components';
import ArrowRightRoundedIcon from '@mui/icons-material/ArrowRightRounded';
import { Box, Button, Card, CardContent, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { subscriptionFeatures } from './subscriptionFeatures';

export const SubscriptionCard = () => {
  const { value: isExportOpen, handleOpen, handleClose } = useToggle();

  const exportInvoices = (filters: InvoiceExportFilters) => {
    console.log(filters);
    handleClose();
  };

  return (
    <Card className='card subscription-card'>
      <CardContent>
        <Box className='subscription-header'>
          <Typography className='section-title-subscription'>Mon abonnement</Typography>
          <Button variant='contained' className='export-invoice-action' name='open-invoice-export-modal' onClick={handleOpen}>
            Télécharger mes factures
          </Button>
        </Box>
        <Typography className='price-subscription'>Pour 49 € par mois :</Typography>

        <List disablePadding>
          {subscriptionFeatures.map((item, index) => (
            <ListItem key={index} className='list-subscription' sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <ArrowRightRoundedIcon className='arrow-list' />
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <InvoiceExportModal open={isExportOpen} onClose={handleClose} onSubmit={exportInvoices} />
        <Typography className='unsubscribe-text'>
          Pour résilier votre abonnement merci d'écrire à <a href='mailto:contact@birdia.fr'>contact@birdia.fr</a>.
        </Typography>
      </CardContent>
    </Card>
  );
};
