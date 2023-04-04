import { useListContext, useNotify, useRefresh, useUnselectAll, useTranslate } from 'react-admin';

import { Archive as ArchiveIcon } from '@mui/icons-material';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useState } from 'react';
import { ProductStatus } from 'bpartners-react-client';
import { BPButton } from 'src/common/components/BPButton';
import dataProvider from 'src/providers/data-provider';

const getValueFromSource = (resource, source) => {
  if (source.includes('|||')) {
    const [s1, s2] = source.split(' ||| ');
    return `${resource[s1]} ${resource[s2]}`;
  }
  return resource[source];
};

const ArchiveBulkAction = ({ source }) => {
  const { selectedIds, data, resource } = useListContext();
  const [isDialogOpen, setDialogState] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const notify = useNotify();
  const refresh = useRefresh();
  const unselectAll = useUnselectAll(resource);
  const translate = useTranslate();

  const handleClose = () => !isLoading && setDialogState(false);
  const handleOpen = () => setDialogState(true);
  const handleSubmit = () => {
    setLoading(true);
    const archive = async () => {
      try {
        const data = selectedIds.map(id => ({ id, status: ProductStatus.DISABLED }));
        await dataProvider.archive(resource, { data });
        setLoading(false);
        handleClose();
        refresh();
        unselectAll();
        notify(`${translate(`resources.${resource}.name`, { smart_count: 2 })} archivés avec succès`, { type: 'success' });
      } catch (_error) {
        setLoading(false);
        notify("Une erreur s'est produite", { type: 'error' });
      }
    };
    archive();
  };

  return (
    selectedIds &&
    selectedIds.length > 0 && (
      <>
        <BPButton
          data-testid={`archive-${resource}-button`}
          label='Archiver'
          style={{ width: '10rem', paddingBlock: 1 }}
          onClick={handleOpen}
          icon={<ArchiveIcon />}
        />
        <Dialog fullScreen={false} open={isDialogOpen} onClose={handleClose}>
          <DialogTitle>{`Les ${translate(`resources.${resource}.name`, { smart_count: 2 }).toLowerCase()} suivants vont être archivés :`}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <ul>
                {(data || [])
                  .filter(resource => selectedIds.includes(resource.id))
                  .map(resource => (
                    <li>{getValueFromSource(resource, source || 'description')}</li>
                  ))}
              </ul>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button disabled={isLoading} onClick={handleClose} autoFocus>
              Annuler
            </Button>
            <Button
              data-testId={`submit-archive-${resource}`}
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
export default ArchiveBulkAction;
