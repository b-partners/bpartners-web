import useGetAccountHolder from '@/common/hooks/use-get-account-holder';
import { prettyPrintMinors } from '@/common/utils';
import { Table, TableBody, TableCell, TableRow } from '@mui/material';
import { FC } from 'react';
import { SelectedInvoiceTableProps } from './types';

export const SelectedInvoiceTable: FC<SelectedInvoiceTableProps> = ({ invoice = {} }) => {
  const { companyInfo } = useGetAccountHolder();
  const isSubjectToVat = companyInfo?.isSubjectToVat;
  const price = isSubjectToVat ? 'totalPriceWithVat' : 'totalPriceWithoutVat';

  const { ref, title, customer } = invoice;

  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell>{ref}</TableCell>
          <TableCell>{title}</TableCell>
          <TableCell>{customer?.name}</TableCell>
          <TableCell>{prettyPrintMinors(invoice[price])}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};
