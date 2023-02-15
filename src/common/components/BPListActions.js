import { CreateButton, ExportButton } from 'react-admin';

import PopoverButton from './PopoverButton';
import { MoreVert as MoreIcon } from '@mui/icons-material';
import { Box } from '@mui/material';

const BPListActions = props => {
  const { buttons, hasCreate, hasExport, importComponent, label, icon } = props;
  return (
    <PopoverButton style={{ marginRight: 5.2 }} icon={icon || <MoreIcon />} label={label || 'Menu'}>
      <Box sx={{ width: '13rem', padding: 0.5, display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {hasCreate !== false && <CreateButton data-testId='create-button' label='Créer' sx={{ width: '12rem', margin: 1, paddingBlock: 1 }} />}
        {buttons}
        {importComponent}
        {hasExport !== false && (
          <ExportButton data-testId='export-button' label='Exporter' sx={{ width: '12rem', marginInline: 1, marginBottom: 1, paddingBlock: 1 }} />
        )}
      </Box>
    </PopoverButton>
  );
};

export default BPListActions;
