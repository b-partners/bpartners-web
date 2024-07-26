import { BPButton } from '@/common/components/BPButton';
import { dataProvider } from '@/providers';
import { ProductStatus as ArchiveStatus } from '@bpartners/typescript-client';
import { Archive as ArchiveIcon } from '@mui/icons-material';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useState } from 'react';
import { useListContext, useNotify, useRefresh, useTranslate, useUnselectAll } from 'react-admin';
import { v4 as uuidV4 } from 'uuid';
import { useToggle } from '../hooks/use-toggle';

const getValueFromSource = (resource: any, source: string) => {
  if (source.includes('|||')) {
    const [s1, s2] = source.split(' ||| ');
    return `${resource[s1]} ${resource[s2]}`;
  }
  return resource[source];
};

const useGetResourceName = () => {
  const translate = useTranslate();
  const translateOption = { smart_count: 2 };
  return (resource: string) => translate(`resources.${resource}.name`, translateOption);
};

const ArchiveBulkAction = ({ source, statusName }: { source: string; statusName: string }) => {
  const { selectedIds, data = [], resource } = useListContext();
  const { value: isDialogOpen, handleClose, handleOpen } = useToggle();
  const [isLoading, setIsLoading] = useState(false);
  const notify = useNotify();
  const refresh = useRefresh();
  const unselectAll = useUnselectAll(resource);
  const getResourceName = useGetResourceName();

  const handleCloseDialog = () => !isLoading && handleClose();

  const handleSubmit = () => {
    setIsLoading(true);
    const archive = async () => {
      const data = selectedIds.map(id => ({ id, [statusName || 'status']: ArchiveStatus.DISABLED }));
      await dataProvider.archive(resource, { data });
      setIsLoading(false);
      handleCloseDialog();
      refresh();
      unselectAll();
      notify(`${getResourceName(resource)} archivés avec succès`, { type: 'success' });
    };

    archive().catch(() => {
      setIsLoading(false);
      notify('messages.global.error', { type: 'error' });
    });
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
        <Dialog fullScreen={false} open={isDialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>{`Les ${getResourceName(resource).toLowerCase()} suivants vont être archivés :`}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <ul>
                {data
                  .filter(resource => selectedIds.includes(resource.id))
                  .map(resource => (
                    <li key={uuidV4()}>{getValueFromSource(resource, source || 'description')}</li>
                  ))}
              </ul>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button disabled={isLoading} onClick={handleCloseDialog} autoFocus>
              Annuler
            </Button>
            <Button
              data-testid={`submit-archive-${resource}`}
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
