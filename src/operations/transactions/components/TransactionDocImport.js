import { UploadFile } from '@mui/icons-material';
import { Box, IconButton, Tooltip } from '@mui/material';
import { v4 as uuid } from 'uuid';
import { FileInput, FileField, SimpleForm, useNotify } from 'react-admin';
import { filesToArrayBuffer, getMimeType, handleSubmit } from 'src/common/utils';
import { fileToAttachmentApi } from 'src/operations/invoice/utils';
import { transactionSupportingDocProvider } from 'src/providers';

const TransactionDocImport = ({ transaction }) => {
  const notify = useNotify();

  //   const importFile = async e => {
  //     const { files } = e.target;
  //     const localVarAttachments = await filesToArrayBuffer(files, fileToAttachmentApi);
  //     console.log('localVarAttachments', localVarAttachments);
  //     console.log('files', files[0]);
  //     await transactionSupportingDocProvider.saveOrUpdate(transaction.id, localVarAttachments[0]);
  //   };

  const handleImportFile = files => {
    const importFile = async () => {
      console.log('files', files);
      const resources = { files: files, tId: transaction.id };
      await transactionSupportingDocProvider.saveOrUpdate(resources);

      notify('Document ajouté avec succès.', { type: 'success' });
      //   const user = getCached.user();
      //   const whoami = getCached.whoami();
      //   cache.user({ ...user, logoFileId: logoFileId });
      //   cache.whoami({ ...whoami, user: { ...user, logoFileId: logoFileId } });
      //   getLogo().catch(printError);
    };

    importFile().catch(() => notify('messages.global.error', { type: 'error' }));
    //   .finally(() => {
    //     getLogo().catch(printError);
    //   });
  };
  //   const importFile2 = async values => {
  //     console.log('values', values);
  //   };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
      {/* <SimpleForm onSubmit={importFile2}>
        <FileInput source='attachment' maxSize={1000000}>
          <FileField source='src' title='title' />
        </FileInput>
      </SimpleForm> */}
      <Tooltip title='Importer un document'>
        <IconButton size='small' sx={{ minWidth: '2rem', borderRadius: '0.5rem' }}>
          <label htmlFor='attachment-input'>
            <UploadFile />
          </label>
          <input id='attachment-input' style={{ display: 'none' }} onChange={handleImportFile} type='file' />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default TransactionDocImport;
