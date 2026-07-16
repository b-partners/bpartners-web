import { BPButton } from '@/common/components';
import { useDialog } from '@/common/store/dialog';
import { DEFAULT_EXPORT_PDF_CONF, EXPORT_PDF_CONF_OPTIONS } from '@/constants';
import { ExportAreaPictureAnnotationConf } from '@bpartners/typescript-client';
import { DialogActions, DialogContent, DialogTitle, FormControlLabel, FormGroup, Switch } from '@mui/material';
import { FC, useState } from 'react';
import { ExportPdfConfDialogStyle } from './style';

interface ExportPdfConfDialogProps {
  onConfirm: (conf: ExportAreaPictureAnnotationConf) => void;
}

export const ExportPdfConfDialog: FC<ExportPdfConfDialogProps> = ({ onConfirm }) => {
  const { close } = useDialog();
  const [conf, setConf] = useState<ExportAreaPictureAnnotationConf>(DEFAULT_EXPORT_PDF_CONF);

  const toggleConf = (key: keyof ExportAreaPictureAnnotationConf) => setConf(prev => ({ ...prev, [key]: !prev[key] }));

  const handleConfirm = () => {
    onConfirm(conf);
    close();
  };

  return (
    <DialogContent sx={ExportPdfConfDialogStyle}>
      <DialogTitle sx={{ px: 0 }}>Contenu du rapport PDF</DialogTitle>
      <FormGroup className='conf-options'>
        {EXPORT_PDF_CONF_OPTIONS.map(({ key, label }) => (
          <FormControlLabel key={key} control={<Switch checked={!!conf[key]} onChange={() => toggleConf(key)} />} label={label} />
        ))}
      </FormGroup>
      <DialogActions sx={{ px: 0 }}>
        <BPButton label='ra.action.cancel' variant='outlined' color='secondary' onClick={close} />
        <BPButton label='bp.action.confirm' onClick={handleConfirm} data-testid='export-pdf-conf-confirm' />
      </DialogActions>
    </DialogContent>
  );
};
