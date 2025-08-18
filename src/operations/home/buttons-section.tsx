import { Add } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { useRedirect } from 'react-admin';
import { buttons_section_style } from './styles';

export const ButtonsSection = () => {
  const redirect = useRedirect();

  const goToCreateClient = () => redirect('create', 'customers');
  const goToCreateProduct = () => redirect('create', 'products');
  const goToCreateInvoice = () => redirect('list', `invoices?showCreateQuote=true`);

  return (
    <Box component='div' sx={buttons_section_style}>
      <Box>
        <Box>
          <Typography>Clients</Typography>
        </Box>
        <Box component='button' onClick={goToCreateClient}>
          <Add />
        </Box>
      </Box>
      <Box>
        <Box>
          <Typography>Produits</Typography>
        </Box>
        <Box component='button' onClick={goToCreateProduct}>
          <Add />
        </Box>
      </Box>
      <Box>
        <Box>
          <Typography>Devis/Factures</Typography>
        </Box>
        <Box component='button' onClick={goToCreateInvoice}>
          <Add />
        </Box>
      </Box>
    </Box>
  );
};
