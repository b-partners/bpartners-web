import { useInvoiceToolContext } from '@/common/store/invoice';
import { formatDateTime } from '@/common/utils';
import { fileProvider } from '@/providers';
import { Attachment, InvoiceRelaunch } from '@bpartners/typescript-client';
import { DownloadForOffline as DownloadForOfflineIcon } from '@mui/icons-material';
import { Box, Button, Card, CardContent, CardHeader, Chip } from '@mui/material';
import { ContentState, convertFromHTML, Editor, EditorState } from 'draft-js';
import { useNotify } from 'react-admin';
import { InvoiceListModal } from '.';
import { InvoiceModalTitle } from './InvoiceModalTitle';

export const InvoiceRelaunchHistoryShowModal = () => {
  const {
    modal: { invoice, metadata },
    openModal,
  } = useInvoiceToolContext();
  const { creationDatetime, emailInfo, attachments }: InvoiceRelaunch = { ...(metadata || {}) };
  const { emailObject, emailBody } = emailInfo || {};
  const notify = useNotify();
  const handleDownload = (attachment: Attachment) => () => {
    notify('messages.download.start', { type: 'info' });
    fileProvider.getOne(attachment.fileId, { fileName: attachment.name, fileType: 'ATTACHMENT' }).catch(error => {
      notify(`Une erreur s'est produite : ${(error as Error)?.message}`, { type: 'error' });
    });
  };

  const blocksFromHtml = convertFromHTML(emailBody || '');
  const defaultContentState = ContentState.createFromBlockArray(blocksFromHtml.contentBlocks, blocksFromHtml.entityMap);
  const richEmailBody = EditorState.createWithContent(defaultContentState);
  return (
    <InvoiceListModal
      type='RELAUNCH_SHOW'
      title={<InvoiceModalTitle label='Historique de relance' invoice={invoice} />}
      actions={
        <Button data-cy='invoice-relaunch-history' onClick={() => openModal({ invoice, isOpen: true, type: 'RELAUNCH_HISTORY' })}>
          Historique des relances
        </Button>
      }
    >
      <Card>
        <CardHeader title={emailObject} subheader={formatDateTime(new Date(creationDatetime))} />
        <CardContent>
          <Editor onChange={() => {}} readOnly editorState={richEmailBody} />
          <Box sx={{ marginTop: '2rem' }}>
            {attachments?.map(e => (
              <Chip label={e.name} key={e.fileId} deleteIcon={<DownloadForOfflineIcon />} onDelete={handleDownload(e)} sx={{ margin: '0.5rem' }} />
            ))}
          </Box>
        </CardContent>
      </Card>
    </InvoiceListModal>
  );
};
