import { ProductStatus as ArchiveStatus } from '@bpartners/typescript-client';
import { Archive as ArchiveIcon } from '@mui/icons-material';
import { Button, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { SaveButton, Toolbar, useNotify, useRedirect, useTranslate } from 'react-admin';
import { useParams } from 'react-router-dom';
import { dataProvider } from '@/providers';

const EditToolBar = props => {
  const [isLoading, setLoading] = useState(false);
  const redirect = useRedirect();
  const translate = useTranslate();
  const notify = useNotify();
  const { id } = useParams();

  const handleSubmit = async () => {
    setLoading(true);
    const data = [{ id, status: ArchiveStatus.DISABLED }];
    await dataProvider.archive(props.resource, { data });
    setLoading(false);
    toList();
    notify(`${translate(`resources.${props.resource}.name`, { smart_count: 1 })} archivé avec succès`, { type: 'success' });
  };

  const toList = () => {
    redirect('list', props.resource);
  };

  return (
    <Toolbar {...props}>
      <SaveButton disabled={props.pristine} />
      <Button
        data-testid={`submit-archive-${props.resource}`}
        disabled={isLoading}
        startIcon={<ArchiveIcon />}
        endIcon={isLoading && <CircularProgress color='inherit' size={18} />}
        onClick={handleSubmit}
      >
        Archiver
      </Button>
    </Toolbar>
  );
};
export default EditToolBar;
