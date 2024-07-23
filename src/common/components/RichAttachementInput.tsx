import { fileToAttachmentApi } from '@/operations/invoice/utils/utils';
import { AttachFile } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { ChangeEvent, useContext } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { filesToArrayBuffer, handleSubmit } from '../utils';
import { AttachementContext } from './RichTextForm';

export const RichAttachementInput = () => {
  const { setValue } = useFormContext();
  const { attachments } = useWatch();
  const { attachments: needAttachments } = useContext(AttachementContext);

  const handleAttachFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    const localVarAttachments = await filesToArrayBuffer(files, fileToAttachmentApi);
    setValue('attachments', attachments.concat(...localVarAttachments));
  };

  return needAttachments ? (
    <IconButton size='small' title='Pièce jointe' sx={{ minWidth: '2rem', borderRadius: '0.5rem' }}>
      <label htmlFor='attachment-input'>
        <AttachFile />
      </label>
      <input id='attachment-input' style={{ display: 'none' }} onChange={handleSubmit(handleAttachFile)} type='file' multiple />
    </IconButton>
  ) : (
    <div></div>
  );
};
