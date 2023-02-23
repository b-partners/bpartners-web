import { CreateButton, ExportButton } from 'react-admin';

import { Stack } from '@mui/material';

const BPListActions = props => {
  const { buttons, hasCreate, hasExport, importComponent } = props;
  return (
    <Stack direction='row' spacing={1}>
      {hasCreate !== false && <CreateButton data-testId='create-button' label='Créer' sx={{ width: '10rem', paddingBlock: 1 }} />}
      {buttons}
      {importComponent}
      {hasExport !== false && <ExportButton data-testId='export-button' label='Exporter' sx={{ width: '10rem', paddingBlock: 1 }} />}
    </Stack>
  );
};

export default BPListActions;
