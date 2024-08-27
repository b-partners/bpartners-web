import { exportCustomers, exportProducts } from '@/providers';
import { FileDownload } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { FC, ReactNode } from 'react';
import { CreateButton, useNotify } from 'react-admin';
import { IMPORT_BUTTON_STYLE } from './BPImport/style';

export type BPListActionsType = {
  buttons?: ReactNode;
  hasCreate?: boolean;
  hasExport?: boolean;
  importComponent: ReactNode;
  fileName: string;
};

const BPListActions: FC<BPListActionsType> = props => {
  const { buttons, hasCreate, hasExport, importComponent, fileName } = props;
  const notify = useNotify();

  const exportCSV = async () => {
    try {
      const data = fileName === 'customers' ? await exportCustomers() : await exportProducts();
      const blob = new Blob([data], { type: 'text/csv' });

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      notify('messages.export.success', { type: 'success' });
    } catch (error) {
      notify('messages.export.error', { type: 'error' });
    }
  };
  return (
    <Stack direction='row' spacing={1}>
      {buttons}
      {hasCreate && <CreateButton data-testid='create-button' label='Créer' sx={IMPORT_BUTTON_STYLE} />}
      {importComponent}
      {hasExport && (
        <Button variant='contained' startIcon={<FileDownload />} data-testid={`export-button-${fileName}`} sx={IMPORT_BUTTON_STYLE} onClick={exportCSV}>
          Exporter
        </Button>
      )}
    </Stack>
  );
};

export default BPListActions;
