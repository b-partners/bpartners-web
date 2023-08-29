import { Close, ExpandMore, InsertDriveFile } from '@mui/icons-material';
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  FormHelperText,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import { BP_COLOR } from 'src/bp-theme';
import { filesToArrayBuffer, handleSubmit } from 'src/common/utils';
import { MAX_ATTACHMENT_NAME_LENGTH, fileToAttachmentApi } from 'src/operations/invoice/utils/utils';
import RichTextEditor from './RichTextEditor';
import { useFormContext, useWatch } from 'react-hook-form';
import { BpFormField } from './BPFormField';

export const RichTextForm = ({ attachments: needAttachements }) => {
  const {
    setValue,
    formState: { errors },
  } = useFormContext();
  const { attachments } = useWatch();

  const handleAttachFile = async event => {
    const { files } = event.target;

    const localVarAttachments = await filesToArrayBuffer(files, fileToAttachmentApi);
    setValue('attachments', attachments.concat(...localVarAttachments));
  };

  const handleDeleteAttachment = idx => {
    const localVarAttachments = attachments.slice();
    localVarAttachments.splice(idx, 1);
    setValue('attachments', localVarAttachments);
  };

  const richeErrorStyle = errors['message'] ? { border: 'solid 1px red' } : { border: `solid 2px ${BP_COLOR['solid_grey']}` };

  return (
    <Box width='50vw'>
      <BpFormField style={{ width: '30rem' }} name='subject' label='Objet' data-test-item='subject-field' fullWidth />

      {needAttachements && (
        <>
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
            </AccordionSummary>

            <AccordionDetails sx={{ py: 0 }}>
              <List disablePadding>
                {attachments.map((attachment, idx) => {
                  const { name: filename } = attachment;
                  const truncatedName =
                    filename.length > MAX_ATTACHMENT_NAME_LENGTH ? filename.slice(0, MAX_ATTACHMENT_NAME_LENGTH - 3).concat('...') : filename;

                  return (
                    <ListItem
                      title={attachment.name}
                      key={attachment.name}
                      sx={{ mx: '0.5rem' }}
                      secondaryAction={
                        <IconButton size='small' onClick={() => handleDeleteAttachment(idx)}>
                          <Close />
                        </IconButton>
                      }
                    >
                      <ListItemText primary={truncatedName} />
                    </ListItem>
                  );
                })}

                {attachments.length === 0 && (
                  <Typography p={2} variant='subtitle2' sx={{ color: 'grey !important' }}>
                    Aucun attachement.
                  </Typography>
                )}
              </List>
            </AccordionDetails>
          </Accordion>

          <AccordionActions sx={{ margin: 0, justifyContent: 'center', borderBottom: `1px solid ${BP_COLOR['solid_grey']}` }}>
            {attachments.length > 0 && (
              <Chip
                sx={{ color: 'white', bgcolor: BP_COLOR[10] }}
                label={attachments.length}
                size='small'
                data-cy-item='num-of-docs'
                title='nombres de fichiers'
              />
            )}

            <label htmlFor='attachment-input'>
              <Tooltip title='joindre un/des fichiers'>
                <IconButton size='small' component='span'>
                  <InsertDriveFile />
                </IconButton>
              </Tooltip>
              <input type='file' id='attachment-input' style={{ display: 'none' }} multiple onChange={handleSubmit(handleAttachFile)} />
            </label>
          </AccordionActions>
        </>
      )}

      <Box sx={{ mt: 2, ...richeErrorStyle, p: 2, borderRadius: 2 }}>
        <RichTextEditor name='message' placeholder='Corps de votre message' />
      </Box>
      {errors['message'] && <FormHelperText error={true}>{errors['message'].message}</FormHelperText>}
    </Box>
  );
};
