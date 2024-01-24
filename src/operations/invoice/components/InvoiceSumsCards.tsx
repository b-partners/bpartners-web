import { Box, Paper, Typography, Skeleton } from '@mui/material';
import invoicePaid from '../../../assets/invoice_paid.svg';
import invoicePending from '../../../assets/invoice_pending.svg';
import devis from '../../../assets/devis.svg';
import { useEffect, useState } from 'react';
import { getInvoicesSummary } from 'src/providers';
import { toMajors } from 'src/common/utils';

const AMOUNT_CARD = {
  display: 'flex',
  alignItems: 'center',
  padding: '2px 10px',
  width: '240px',
  margin: '10px',
};
const InvoiceSumsCards = () => {
  const [amount, setAmount] = useState({
    paid: null,
    unpaid: null,
    proposal: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const getInvoicesSummaryData = async () => {
    setIsLoading(true);
    const { paid, unpaid, proposal } = await getInvoicesSummary();
    setIsLoading(false);
    setAmount({
      paid: paid.amount,
      unpaid: unpaid.amount,
      proposal: proposal.amount,
    });
  };

  useEffect(() => {
    getInvoicesSummaryData();
  }, []);

  const cards = [
    {
      img: devis,
      title: 'Devis',
      amount: amount.proposal,
      bgColor: '#dceeff',
    },
    {
      img: invoicePaid,
      title: 'Factures payées',
      amount: amount.paid,
      bgColor: '#b8e0b3',
    },
    {
      img: invoicePending,
      title: 'Factures en attente',
      amount: amount.unpaid,
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
      {cards.map((card, k) => (
        <Paper elevation={3} key={`amountCard-${k}`} sx={{ ...AMOUNT_CARD, backgroundColor: card.bgColor }}>
          <img src={card.img} alt={card.title} width={40} />
          <Typography component={'div'} sx={{ paddingLeft: '7px' }}>
            <Box sx={{ m: '8px 8px 0 8px' }}>{card.title}</Box>
            {isLoading ? (
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
