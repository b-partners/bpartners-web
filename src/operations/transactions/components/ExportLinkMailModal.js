import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress } from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { BpFormField, BpMultipleTextInput } from 'src/common/components';
import { getExportLinkMailDefaultMessage, getExportLinkMailSubject, invoiceDateValidator } from 'src/operations/invoice/utils';
import { handleSubmit } from 'src/common/utils';
import { AttachmentForm, RichTextForm } from 'src/common/components/RichTextForm';
import RichTextEditor from 'src/common/components/RichTextEditor';
import { Editor, EditorState } from 'draft-js';
import { useFormContext, useWatch } from 'react-hook-form';
import { useModalContext } from 'src/common/store/transaction';
import { mailingProvider } from 'src/providers';
import { emailValidator, participantValidator } from 'src/common/resolvers';
import { v4 as uuid } from 'uuid';
import { transactionMapper } from 'src/providers/mappers/transaction-mapper';
import { useNotify } from 'react-admin';

const ExportLinkMailModal = ({ isOpenModal, handleExpLinkMailModal }) => {
  const id = uuid();
  const { dataForm } = useModalContext();
  const form = useForm({
    mode: 'all',
    defaultValues: {
      subject: getExportLinkMailSubject(dataForm),
      message: getExportLinkMailDefaultMessage(dataForm),
      // message: EditorState.createEmpty(),
      attachments: [],
    },
    // resolver: participantValidator,
  });
  const { isSubmitting } = form.formState;
  const notify = useNotify();
  //   const richeErrorStyle = errors['message'] ? { border: 'solid 1px red' } : { border: `solid 2px ${BP_COLOR['solid_grey']}` };

  // useEffect(() => {
  //   form.setValue('message', getExportLinkMailDefaultMessage(dataForm));
  // }, [dataForm, form]);

  const handleEmailRequest = async (structuredData, status) => {
    try {
      await mailingProvider.saveOrUpdate(structuredData);
      notify(`messages.mail.${status}`, { type: 'success' });
      handleExpLinkMailModal();
    } catch (error) {
      notify('messages.global.error', { type: 'error' });
    }
  };
  const sendEmail = form.handleSubmit(data => {
    const structuredData = transactionMapper(data, id, 'SENT');
    handleEmailRequest(structuredData, 'sent');
  });
  const saveDraft = form.handleSubmit(data => {
    const structuredData = transactionMapper(data, id, 'DRAFT');
    handleEmailRequest(structuredData, 'draft');
  });

  console.log('isSubmitting', isSubmitting);

  return (
    <FormProvider {...form}>
      <Dialog open={isOpenModal} onClose={handleExpLinkMailModal} maxWidth='lg'>
        <DialogTitle>Envoi de mail</DialogTitle>
        <Box width='33.4vw' margin='0 24px'>
          <BpMultipleTextInput name='recipient' label='Destinataire' title='' validator={participantValidator} />
        </Box>
        <form onSubmit={handleSubmit(sendEmail)}>
          <DialogContent>
            <RichTextForm attachments={true} />
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'flex-end', mr: 2, alignItems: 'center', position: 'relative' }}>
            <Button onClick={handleExpLinkMailModal} name='export-link-modal-cancel-button'>
              Annuler
            </Button>
            <Button
              type='button'
              name='export-link-modal-submit-button'
              onClick={handleSubmit(saveDraft)}
              disabled={isSubmitting}
              startIcon={isSubmitting && <CircularProgress color='inherit' size={18} />}
            >
              Enregistrer en brouillon
            </Button>
            <Button
              type='submit'
              name='export-link-modal-submit-button'
              disabled={isSubmitting}
              startIcon={isSubmitting && <CircularProgress color='inherit' size={18} />}
            >
              Valider
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </FormProvider>
  );
};

export default ExportLinkMailModal;
