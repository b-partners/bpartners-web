import { CreateButton } from 'react-admin';
import { Button } from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import { Stack } from '@mui/material';
import { IMPORT_BUTTON_STYLE } from './BPImport/style';

const BPListActions = props => {
  const { buttons, hasCreate, hasExport, importComponent, fileName, exportList } = props;

  const exportCSV = async () => {
    const data = await exportList();
    const blob = new Blob([data], { type: 'text/csv' });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Stack direction='row' spacing={1}>
      {buttons}
      {hasCreate !== false && <CreateButton data-testid='create-button' label='Créer' sx={IMPORT_BUTTON_STYLE} />}
      {importComponent}
      {hasExport !== false && (
        <Button variant='contained' startIcon={<FileDownload />} data-testid='export-button' label='Exporter' sx={IMPORT_BUTTON_STYLE} onClick={exportCSV}>
          Exporter
        </Button>
      )}
    </Stack>
  );
};

export default BPListActions;
