import { Box, Paper, Skeleton, Typography } from '@mui/material';
import { useStore } from 'react-admin';
import { toMajors } from '@/common/utils';
import devis from '../../../assets/devis.svg';
import invoicePaid from '../../../assets/invoice_paid.svg';
import invoicePending from '../../../assets/invoice_pending.svg';

const AMOUNT_CARD = {
  display: 'flex',
  alignItems: 'center',
  padding: '2px 10px',
  width: '240px',
  margin: '10px',
};
const InvoiceSumsCards = () => {
  const [invoicesSummary] = useStore('amounts');
  const cards = [
    {
      img: devis,
      title: 'Devis',
      amount: invoicesSummary?.proposal,
      bgColor: '#dceeff',
    },
    {
      img: invoicePaid,
      title: 'Factures payées',
      amount: invoicesSummary?.paid,
      bgColor: '#b8e0b3',
    },
    {
      img: invoicePending,
      title: 'Factures en attente',
      amount: invoicesSummary?.unpaid,
      bgColor: '#fae6ab',
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-evenly',
      }}
    >
      {cards?.map((card, k) => (
        <Paper elevation={3} key={`amountCard-${k}`} sx={{ ...AMOUNT_CARD, backgroundColor: card.bgColor }}>
          <img src={card.img} alt={card.title} width={40} />
          <Typography component={'div'} sx={{ paddingLeft: '7px' }}>
            <Box sx={{ m: '8px 8px 0 8px' }}>{card.title}</Box>
            {!invoicesSummary ? (
              <Skeleton animation='wave' height={35} width='60px' />
            ) : (
              <Box sx={{ fontWeight: 'bold', m: '0 8px 8px 8px', fontSize: '18px' }}>
                {`${toMajors(card.amount).toFixed(2).toLocaleString()} ${'€'}`.replace('.', ',')}
              </Box>
            )}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default InvoiceSumsCards;
