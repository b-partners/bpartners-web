import { CreateButton, useNotify } from 'react-admin';
import { Button, Stack } from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import { IMPORT_BUTTON_STYLE } from './BPImport/style';
import { exportCustomers, exportProducts } from 'src/providers';

const BPListActions = props => {
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
        <Button
          variant='contained'
          startIcon={<FileDownload />}
          data-testid={`export-button-${fileName}`}
          label='Exporter'
          sx={IMPORT_BUTTON_STYLE}
          onClick={exportCSV}
        >
          Exporter
        </Button>
      )}
    </Stack>
  );
};

export default BPListActions;
