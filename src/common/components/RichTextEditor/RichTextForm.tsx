import { BP_COLOR } from '@/bp-theme';
import { Box, FormHelperText } from '@mui/material';
import { createContext, FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { BpFormField } from '../BpFormField';
import { AttachmentForm } from './RichAttachementForm';
import { RichTextEditor } from './RichTextEditor';
import { RichTextFormProps } from './types';

export const AttachementContext = createContext({ attachments: false });

export const RichTextForm: FC<RichTextFormProps> = ({ attachments }) => {
  const {
    formState: { errors },
  } = useFormContext();

  const richeErrorStyle = errors['message'] ? { border: 'solid 1px red' } : { border: `solid 2px ${BP_COLOR['solid_grey']}` };

  return (
    <AttachementContext.Provider value={{ attachments }}>
      <Box width='50vw'>
        <BpFormField style={{ width: '30rem' }} name='subject' label='Objet' data-test-item='subject-field' fullWidth />
        <Box sx={{ mt: 2, ...richeErrorStyle, p: 2, paddingTop: 0, borderRadius: 2, height: '30vh', overflowY: 'auto' }}>
          <RichTextEditor name='message' placeholder='Corps de votre message' />
        </Box>
        {errors['message'] && <FormHelperText error={true}>{errors['message'].message as string}</FormHelperText>}
        {attachments && <AttachmentForm />}
      </Box>
    </AttachementContext.Provider>
  );
};
