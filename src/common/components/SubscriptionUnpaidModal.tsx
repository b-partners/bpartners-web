import { authProvider, cache, getUnpaidSubscriptionInvoices } from '@/providers';
import ReportGmailerrorredRoundedIcon from '@mui/icons-material/ReportGmailerrorredRounded';
import { Box, Button, CircularProgress, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { formatDate, prettyPrintMinors, Redirect } from '../utils';
import { BPButton } from './BPButton';
import { SubscriptionUnpaidModalStyle } from './style';

const SUPPORT_EMAIL = 'contact@birdia.fr';

export const SubscriptionUnpaidModal = () => {
  const { data: unpaidInvoices = [], isLoading, isFetching, refetch } = useQuery({ queryKey: ['UnpaidSubscriptionInvoicesQuery'], queryFn: getUnpaidSubscriptionInvoices });
  const hadUnpaid = useRef(false);

  useEffect(() => {
    if (isFetching) return;
    if (unpaidInvoices.length > 0) {
      hadUnpaid.current = true;
    } else if (hadUnpaid.current) {
      hadUnpaid.current = false;
      cache.whoami(undefined);
      Redirect.reload();
    }
  }, [unpaidInvoices, isFetching]);

  const onLogout = () => authProvider.logout().then(() => Redirect.toURL(`${location.hostname}/login`));
  const onPay = (paymentUrl: string) => window.open(paymentUrl, '_blank', 'noopener,noreferrer');

  return (
    <Box sx={SubscriptionUnpaidModalStyle}>
      <Box className='unpaid-icon'>
        <ReportGmailerrorredRoundedIcon />
      </Box>
      <Typography className='unpaid-title'>Paiement en échec</Typography>
      <Typography className='unpaid-text'>
        Un paiement n'a pas pu être traité sur l'un de vos abonnements. Régularisez vos factures impayées ci-dessous pour rétablir l'accès à votre compte.
      </Typography>

      {isLoading ? (
        <CircularProgress className='unpaid-loader' size={24} />
      ) : (
        unpaidInvoices.length > 0 && (
          <>
            <TableContainer className='unpaid-table-container'>
              <Table className='unpaid-table' size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell>Échéance</TableCell>
                    <TableCell align='right'>Montant</TableCell>
                    <TableCell align='right' />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unpaidInvoices.map(({ invoice, paymentUrl }) => (
                    <TableRow key={invoice?.id ?? paymentUrl}>
                      <TableCell className='unpaid-cell-desc'>{invoice?.title || invoice?.ref || "Facture d'abonnement"}</TableCell>
                      <TableCell className='unpaid-cell-due'>{invoice?.toPayAt ? formatDate(new Date(invoice.toPayAt)) : '—'}</TableCell>
                      <TableCell className='unpaid-cell-amount' align='right'>
                        {invoice?.totalPriceWithVat != null ? prettyPrintMinors(invoice.totalPriceWithVat) : '—'}
                      </TableCell>
                      <TableCell align='right'>
                        <Button className='unpaid-item-pay' variant='contained' disableElevation onClick={() => paymentUrl && onPay(paymentUrl)}>
                          Régler
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              className='unpaid-refresh'
              variant='outlined'
              disabled={isFetching}
              startIcon={isFetching ? <CircularProgress color='inherit' size={14} /> : undefined}
              onClick={() => refetch()}
            >
              J'ai payé — Actualiser
            </Button>
          </>
        )
      )}

      <Typography className='unpaid-text'>
        Un problème avec votre paiement ? Contactez notre équipe à{' '}
        <Link className='unpaid-mail' href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </Link>
        .
      </Typography>
      <BPButton className='unpaid-logout' label='Se déconnecter' onClick={onLogout} />
    </Box>
  );
};
