import { BP_COLOR } from '@/bp-theme';
import { MAX_ATTACHMENT_NAME_LENGTH } from '@/operations/invoice/utils/utils';
import { ExpandMore, InsertDriveFile } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Badge, Box, Chip, FormHelperText, List, Typography } from '@mui/material';
import { createContext } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { stringCutter } from '../utils';
import { BpFormField } from './BpFormField';
import RichTextEditor from './RichTextEditor';

export const AttachementContext = createContext({ attachments: false });

export const AttachmentForm = () => {
  const { setValue } = useFormContext();
  const { attachments } = useWatch();

  const handleDeleteAttachment = idx => {
    const localVarAttachments = attachments.slice();
    localVarAttachments.splice(idx, 1);
    setValue('attachments', localVarAttachments);
  };

  return (
    <Accordion sx={{ mt: 2, border: 'none', '&:before': { display: 'none' } }} defaultExpanded>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          borderTop: 'none',
          borderBottom: `1px solid ${BP_COLOR['solid_grey']}`,
          p: 0,
          '&.MuiAccordionSummary-content': {
            my: 0,
          },
        }}
      >
        <Typography variant='subtitle1'>Pieces jointes</Typography>
        <Badge badgeContent={`${attachments?.length || 0}`} sx={{ marginInline: '1rem' }}>
          <InsertDriveFile sx={{ color: BP_COLOR['10'] }} />
        </Badge>
      </AccordionSummary>
      <AccordionDetails sx={{ py: 0 }}>
        <List>
          {attachments.map((attachment, idx) => {
            const { name: filename } = attachment;
            const truncatedName = stringCutter(filename, MAX_ATTACHMENT_NAME_LENGTH);

            return <Chip sx={{ marginTop: '0.3rem', marginLeft: '0.3rem' }} label={truncatedName} onDelete={() => handleDeleteAttachment(idx)} />;
          })}

          {attachments.length === 0 && (
            <Typography p={2} variant='subtitle2' sx={{ color: 'grey !important' }}>
              Aucun attachement.
            </Typography>
          )}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

export const RichTextForm = ({ attachments }) => {
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
        {errors['message'] && <FormHelperText error={true}>{errors['message'].message}</FormHelperText>}
        {attachments && <AttachmentForm />}
      </Box>
    </AttachementContext.Provider>
  );
};
