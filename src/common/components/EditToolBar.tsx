import { dataProvider } from '@/providers';
import { ProductStatus as ArchiveStatus } from '@bpartners/typescript-client';
import { Archive as ArchiveIcon } from '@mui/icons-material';
import { Button, CircularProgress } from '@mui/material';
import { FC, useState } from 'react';
import { SaveButton, Toolbar, ToolbarProps, useNotify, useRedirect, useTranslate } from 'react-admin';
import { useParams } from 'react-router-dom';

export type EditToolBarProps = ToolbarProps & {
  resource: string;
  pristine: boolean;
};

const EditToolBar: FC<EditToolBarProps> = ({ resource, pristine, ...toolbarProps }) => {
  const [isLoading, setIsLoading] = useState(false);
  const redirect = useRedirect();
  const translate = useTranslate();
  const notify = useNotify();
  const { id } = useParams();

  const handleSubmit = async () => {
    setIsLoading(true);
    const data = [{ id, status: ArchiveStatus.DISABLED }];
    const message = `resources.${resource}.name`;
    await dataProvider.archive(resource, { data });
    setIsLoading(false);
    toList();
    notify(`${translate(message, { smart_count: 1 })} archivé avec succès`, { type: 'success' });
  };

  const toList = () => {
    redirect('list', resource);
  };

  return (
    <Toolbar {...toolbarProps}>
      <SaveButton disabled={pristine} />
      <Button
        data-testid={`submit-archive-${resource}`}
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
