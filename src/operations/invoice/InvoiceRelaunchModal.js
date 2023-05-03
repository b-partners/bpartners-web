import { Close, ExpandMore, InsertDriveFile } from '@mui/icons-material';
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNotify } from 'react-admin';
import { BP_COLOR } from '../../bp-theme';
import { filesToArrayBuffer } from '../../common/utils/file';
import RichTextEditor from '../../common/components/RichTextEditor';
import { fileToAttachmentApi, MAX_ATTACHMENT_NAME_LENGTH } from './utils/utils';
import { handleSubmit } from 'src/common/utils';
import { authProvider, getCached, payingApi } from 'src/providers';

const InvoiceRelaunchModal = ({ invoice = null, resetInvoice }) => {
  const notify = useNotify();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [attachments, setAttachments] = useState([]);

  const onClose = () => {
    resetInvoice();
    setAttachments([]);
  };

  const getContext = ({ devis, facture }) => (invoice.status === 'PROPOSAL' ? `${devis} devis` : `${facture} facture`);

  const relaunchInvoiceSubmit = async _event => {
    const userId = authProvider.getCachedWhoami().user.id;
    if (userId) {
      setIsLoading(true);

      try {
        const { accountId } = getCached.userInfo();
        await payingApi().relaunchInvoice(accountId, invoice.id, { message, subject, attachments });
        notify(
          `${getContext({
            devis: 'Le',
            facture: 'La',
          })} ref: ${invoice.ref} a été relancée avec succès.`,
          { type: 'success' }
        );
        resetInvoice();
      } catch (e) {
        notify('messages.global.error', { type: 'error' });
      }
      setIsLoading(false);
    }
  };

  return (
    invoice && (
      <Dialog open={invoice} onClose={onClose} maxWidth='lg'>
        <DialogTitle>
          Relance manuelle {getContext({ devis: 'du', facture: 'de la' })} ref: {invoice.ref}
        </DialogTitle>
        <DialogContent>
          <InvoiceRelaunchForm setMessage={setMessage} setSubject={setSubject} setAttachments={setAttachments} attachments={attachments} />
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', alignItems: 'center' }}>
          <Button
            disabled={isLoading}
            onClick={handleSubmit(relaunchInvoiceSubmit)}
            data-cy='invoice-relaunch-submit'
            startIcon={isLoading && <CircularProgress color='inherit' size={18} />}
          >
            Relancer {getContext({ devis: 'ce', facture: 'cette' })}
          </Button>
        </DialogActions>
      </Dialog>
    )
  );
};

const InvoiceRelaunchForm = ({ setMessage, setSubject, attachments, setAttachments }) => {
  const handleChange = ({ target }) => setSubject(target.value);

  const handleAttachFile = async event => {
    const { files } = event.target;

    const localVarAttachments = await filesToArrayBuffer(files, fileToAttachmentApi);
    setAttachments(attachments => attachments.concat(...localVarAttachments));
  };

  const handleDeleteAttachment = idx => {
    const localVarAttachments = attachments.slice();

    localVarAttachments.splice(idx, 1);
    setAttachments(localVarAttachments);
  };

  return (
    <Box>
      <TextField name='subject' label='Objet' data-test-item='subject-field' fullWidth onChange={handleChange} />

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
              const truncatedName = filename.length > MAX_ATTACHMENT_NAME_LENGTH ? filename.slice(0, MAX_ATTACHMENT_NAME_LENGTH - 3).concat('...') : filename;

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
          <Chip sx={{ color: 'white', bgcolor: BP_COLOR[10] }} label={attachments.length} size='small' data-cy-item='num-of-docs' title='nombres de fichiers' />
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

      <Box sx={{ mt: 2 }}>
        <Typography variant='subtitle1' mb={2}>
          Message
        </Typography>

        <RichTextEditor placeholder='corps de votre message' setContent={setMessage} />
      </Box>
    </Box>
  );
};

export default InvoiceRelaunchModal;
