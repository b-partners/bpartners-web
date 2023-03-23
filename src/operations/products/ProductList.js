import { Datagrid, FunctionField, List, TextInput, useListContext, useNotify, useRefresh, useUnselectAll } from 'react-admin';
import { EmptyList } from '../../common/components/EmptyList';
import ListComponent from '../../common/components/ListComponent';

import { prettyPrintMinors as ppMoneyMinors } from '../../common/utils/money';
import { prettyPrintMinors as ppVatMinors } from '../../common/utils/vat';

import { Archive as ArchiveIcon } from '@mui/icons-material';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useState } from 'react';
import { BPImport } from 'src/common/components/BPImport';
import BPListActions from '../../common/components/BPListActions';
import Pagination, { pageSize } from '../../common/components/Pagination';
import useGetAccountHolder from '../../common/hooks/use-get-account-holder';
import { archiveInvoice } from 'src/providers/product-provider';
import { ProductStatus } from 'bpartners-react-client';
import { BPButton } from 'src/common/components/BPButton';

const productFilter = [
  <TextInput label='Filtrer par description' source='descriptionFilter' size='small' alwaysOn />,
  <TextInput label='Filtrer par prix unitaire' source='priceFilter' size='small' alwaysOn />,
];

const ProductList = () => (
  <List
    actions={<BPListActions importComponent={<BPImport source='product' />} buttons={<ProductBulkAction />} />}
    resource='products'
    hasCreate={true}
    hasEdit={false}
    hasList={false}
    hasShow={false}
    filters={productFilter}
    component={ListComponent}
    pagination={<Pagination />}
    perPage={pageSize}
    sx={{
      '& .RaBulkActionsToolbar-toolbar': { display: 'none' },
    }}
  >
    <Product />
  </List>
);

const Product = () => {
  const { isLoading } = useListContext();
  const { companyInfo } = useGetAccountHolder();
  const isSubjectToVat = companyInfo && companyInfo.isSubjectToVat;
  return (
    !isLoading && (
      <Datagrid rowClick='edit' empty={<EmptyList />}>
        <FunctionField
          source='description'
          label='Description'
          render={({ description }) =>
            //TODO: test is missing
            description.length < 60 ? description : description.slice(0, 60) + '...'
          }
        />
        <FunctionField source='unitPrice' label='Prix unitaire HT' render={record => ppMoneyMinors(record.unitPrice)} />
        {isSubjectToVat && <FunctionField source='vatPercent' label='TVA' render={record => ppVatMinors(record.vatPercent)} />}
        {isSubjectToVat && <FunctionField source='unitPriceWithVat' label='Prix unitaire TTC' render={record => ppMoneyMinors(record.unitPriceWithVat)} />}
      </Datagrid>
    )
  );
};

const ProductBulkAction = () => {
  const { selectedIds, data, resource } = useListContext();
  const [isDialogOpen, setDialogState] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const notify = useNotify();
  const refresh = useRefresh();
  const unselectAll = useUnselectAll(resource);

  const handleClose = () => !isLoading && setDialogState(false);
  const handleOpen = () => setDialogState(true);
  const handleSubmit = () => {
    setLoading(true);
    const archiveProduct = async () => {
      try {
        await archiveInvoice(selectedIds.map(id => ({ id, status: ProductStatus.DISABLED })));
        setLoading(false);
        handleClose();
        refresh();
        unselectAll();
        notify('Produits archiver avec success', { type: 'success' });
      } catch (_error) {
        setLoading(false);
        notify("Une erreur s'est produite", { type: 'error' });
      }
    };
    archiveProduct();
  };

  return (
    selectedIds &&
    selectedIds.length > 0 && (
      <>
        <BPButton
          data-testid='archive-product-button'
          label='Archiver'
          style={{ width: '10rem', paddingBlock: 1 }}
          onClick={handleOpen}
          icon={<ArchiveIcon />}
        />
        <Dialog fullScreen={false} open={isDialogOpen} onClose={handleClose}>
          <DialogTitle>Les produits suivants vont être archivés :</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <ul>
                {(data || [])
                  .filter(product => selectedIds.includes(product.id))
                  .map(product => (
                    <li>{product.description}</li>
                  ))}
              </ul>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button disabled={isLoading} onClick={handleClose} autoFocus>
              Annuler
            </Button>
            <Button
              data-testId='submit-archive-product'
              disabled={isLoading}
              startIcon={isLoading && <CircularProgress color='inherit' size={18} />}
              onClick={handleSubmit}
              autoFocus
            >
              Archiver
            </Button>
          </DialogActions>
        </Dialog>
      </>
    )
  );
};

export default ProductList;
