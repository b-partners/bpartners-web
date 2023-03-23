import { CreateButton, ExportButton } from 'react-admin';

import { Stack } from '@mui/material';

const BPListActions = props => {
  const { buttons, hasCreate, hasExport, importComponent } = props;
  return (
    <Stack direction='row' spacing={1}>
      {buttons}
      {hasCreate !== false && <CreateButton data-testid='create-button' label='Créer' sx={{ width: '10rem', paddingBlock: 1 }} />}
      {importComponent}
      {hasExport !== false && <ExportButton data-testid='export-button' label='Exporter' sx={{ width: '10rem', paddingBlock: 1 }} />}
    </Stack>
  );
};

export default BPListActions;
