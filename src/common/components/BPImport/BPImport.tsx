import { FileDownload, FileUpload, InsertDriveFile } from '@mui/icons-material';
import { Backdrop, Box, Button, Chip, CircularProgress, Divider, IconButton, Modal, Stack, Tooltip, Typography } from '@mui/material';
import { ChangeEvent, FC, useState } from 'react';

import CustomerModel from '@/assets/CustomerModel.png';
import ProductModel from '@/assets/ProductModel.png';
import { importCustomers } from '@/providers/customer-provider';
import { CANCEL_BUTTON_STYLE, ERROR_BOX_STYLE, IMPORT_BUTTON_STYLE, IMPORT_MODAL_STYLE } from './style';

import { BP_BUTTON } from '@/bp-theme';
import { useToggle } from '@/common/hooks';
import { toArrayBuffer } from '@/common/utils';
import { importProducts } from '@/providers/product-provider';
import { useNotify, useRefresh } from 'react-admin';

interface BPImportProps {
  source: string;
}

export const BPImport: FC<BPImportProps> = props => {
  const notify = useNotify();
  const refresh = useRefresh();
  const { source } = props;
  const subject = source === 'customer' ? 'clients' : 'produits';
  const customerTemplateUrl = process.env.REACT_APP_CUSTOMER_TEMPLATE_URL;
  const productTemplateUrl = process.env.REACT_APP_PRODUCT_TEMPLATE_URL;

  const { value: openModal, handleOpen, handleClose: toggleHandlerClose } = useToggle();
  const handleClose = () => {
    handleDelete();
    toggleHandlerClose();
  };

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    const fetch = async () => {
      const binary = await toArrayBuffer(event);

      setFile(binary);
      setFileName(files[0].name);
    };
    fetch().catch(() => notify('messages.global.error', { type: 'error' }));
  };

  const handleDelete = () => {
    setFile(null);
    setFileName(null);
    setErrorMessages(null);
  };

  const submitFile = () => {
    const fetch = async () => {
      setIsLoading(true);
      source === 'customer' ? await importCustomers(file) : await importProducts(file);
      notify('Importation effectuée avec succès.', { type: 'success' });
      handleClose();
      refresh();
    };
    fetch()
      .catch(({ response }) => {
        const {
          data: { message: messageFromBackend },
          status,
        } = response;

        const message = (messageFromBackend as string) || '';

        if (status === 400) {
          let frenchMessage = message.replace(/instead\sof/gi, 'à la place de');
          frenchMessage = frenchMessage.replace(/at\scolumn/gi, 'à la colonne');
          const endOfMessage = frenchMessage.indexOf('at the last column');
          frenchMessage = endOfMessage !== -1 ? `${frenchMessage.slice(0, endOfMessage)} à la dernière colonne.` : frenchMessage;
          const frenchMessageArray = frenchMessage.split('. ');

          setErrorMessages(frenchMessageArray.filter(item => item !== ''));
        }
        notify(`Une erreur s'est produite lors de l'importation.`, { type: 'error' });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div>
      <Button data-testid='import-modal-button' variant='contained' startIcon={<FileUpload />} onClick={handleOpen} sx={IMPORT_BUTTON_STYLE}>
        Importer
      </Button>
      <Modal open={openModal} onClose={!isLoading && handleClose} aria-labelledby='modal-modal-title' aria-describedby='modal-modal-description'>
        <Box sx={IMPORT_MODAL_STYLE}>
          <Typography id='modal-modal-title' variant='h6' component='h2'>
            Importer des {subject}
          </Typography>
          <Divider />
          <Typography id='modal-modal-description' sx={{ my: 2 }} variant='body2'>
            Pour importer une liste de vos {subject}, le fichier Excel (.xls ou .xlsx) contenant la liste doit suivre le modèle suivant :
          </Typography>
          <img src={source === 'customer' ? CustomerModel : ProductModel} alt='model de fichier' width='100%' />
          <Typography id='modal-modal-description' sx={{ my: 2 }} variant='body2'>
            Veuillez à ce que votre fichier soit structuré comme le modèle avant de l'importer.
          </Typography>
          <Typography id='modal-modal-description-2' sx={{ my: 2 }} variant='body2'>
            Ou mieux encore, téléchargez ce modèle et copiez vos {subject} pour être sûr que les colonnes correspondent.
            <a href={source === 'customer' ? customerTemplateUrl : productTemplateUrl} target='_blank' rel='noreferrer' download>
              <Tooltip title='Télécharger le modèle'>
                <IconButton size='small' component='span' sx={BP_BUTTON}>
                  <FileDownload />
                </IconButton>
              </Tooltip>
            </a>
          </Typography>
          {errorMessages && (
            <Box sx={ERROR_BOX_STYLE}>
              <Typography variant='body2'>Les colonnes suivantes ne correspondent pas :</Typography>
              <ul>
                {errorMessages.map((item, index) => (
                  <li key={item + index}>
                    <Typography variant='body2'>{item}</Typography>
                  </li>
                ))}
              </ul>
            </Box>
          )}
          <Box sx={{ width: 'fit-content', m: 'auto', p: 1 }}>
            {fileName ? (
              <Chip label={fileName} variant='outlined' onDelete={handleDelete} />
            ) : (
              <label htmlFor='file-input' id='upload-file-label'>
                <Tooltip title='importer un fichier'>
                  <IconButton component='span' sx={BP_BUTTON}>
                    <InsertDriveFile />
                  </IconButton>
                </Tooltip>
                <input
                  type='file'
                  id='file-input'
                  style={{ display: 'none' }}
                  onChange={handleChange}
                  accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                />
              </label>
            )}
          </Box>
          <Divider />
          <Stack direction='row' spacing={1} sx={{ my: 2, ml: 'auto', width: 'fit-content' }}>
            <Button sx={CANCEL_BUTTON_STYLE} onClick={handleClose}>
              Annuler
            </Button>
            <Button
              disabled={!file || errorMessages.length > 0 || isLoading}
              variant='contained'
              data-testid='import-button'
              startIcon={isLoading ? <CircularProgress color='inherit' size={18} /> : <FileUpload />}
              onClick={submitFile}
              sx={IMPORT_BUTTON_STYLE}
            >
              Importer
            </Button>
          </Stack>
          <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={isLoading}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress color='inherit' />
              <Typography variant='body2'>Importation en cours...</Typography>
            </Box>
          </Backdrop>
        </Box>
      </Modal>
    </div>
  );
};
