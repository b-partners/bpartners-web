import { useDialog } from '@/common/store/dialog';
import { DEFAULT_EXPORT_PDF_CONF, EXPORT_PDF_CONF_OPTIONS } from '@/constants';
import { ExportAreaPictureAnnotationConf } from '@bpartners/typescript-client';
import {
  ArchitectureOutlined,
  AssessmentOutlined,
  AutoAwesomeOutlined,
  DescriptionOutlined,
  Download,
  LayersOutlined,
  PictureAsPdfOutlined,
  SquareFootOutlined,
  StraightenOutlined,
  ViewInArOutlined,
} from '@mui/icons-material';
import { Box, Button, ButtonBase, Switch, Typography } from '@mui/material';
import { FC, ReactNode, useState } from 'react';
import { ExportPdfConfDialogStyle } from './style';

type ConfKey = keyof ExportAreaPictureAnnotationConf;

const OPTION_META: Record<ConfKey, { icon: ReactNode; description: string }> = {
  showTitlePage: { icon: <DescriptionOutlined />, description: "Page de couverture avec l'adresse et les informations générales." },
  showAnnotationPages: { icon: <LayersOutlined />, description: 'Vue annotée de la toiture en 2D.' },
  showAnnotation3dPages: { icon: <ViewInArOutlined />, description: 'Rendu et annotations du modèle 3D.' },
  showMeasurementSummary: { icon: <StraightenOutlined />, description: 'Tableau récapitulatif des mesures relevées.' },
  showPitchSummary: { icon: <ArchitectureOutlined />, description: 'Détail des pentes par pan de toiture.' },
  showAreaSummary: { icon: <SquareFootOutlined />, description: 'Surfaces calculées par zone.' },
  showOverallSummary: { icon: <AssessmentOutlined />, description: "Synthèse générale de l'analyse." },
  showLlmSummary: { icon: <AutoAwesomeOutlined />, description: "Commentaires générés par l'intelligence artificielle." },
};

const LABEL_BY_KEY = EXPORT_PDF_CONF_OPTIONS.reduce<Record<string, string>>((acc, { key, label }) => ({ ...acc, [key]: label }), {});

const GROUPS: { title: string; keys: ConfKey[] }[] = [
  { title: 'Pages', keys: ['showTitlePage', 'showAnnotationPages', 'showAnnotation3dPages'] },
  { title: 'Résumés', keys: ['showMeasurementSummary', 'showPitchSummary', 'showAreaSummary', 'showOverallSummary', 'showLlmSummary'] },
];

const ALL_KEYS = EXPORT_PDF_CONF_OPTIONS.map(({ key }) => key);

interface ConfRowProps {
  confKey: ConfKey;
  checked: boolean;
  onToggle: (key: ConfKey) => void;
}

const ConfRow: FC<ConfRowProps> = ({ confKey, checked, onToggle }) => (
  <ButtonBase
    className={`conf-row ${checked ? 'conf-row-active' : ''}`}
    onClick={() => onToggle(confKey)}
    role='switch'
    aria-checked={checked}
    aria-label={LABEL_BY_KEY[confKey]}
  >
    <Box className='conf-row-icon'>{OPTION_META[confKey].icon}</Box>
    <Box className='conf-row-text'>
      <Typography className='conf-row-label'>{LABEL_BY_KEY[confKey]}</Typography>
      <Typography className='conf-row-desc'>{OPTION_META[confKey].description}</Typography>
    </Box>
    <Switch className='conf-row-switch' checked={checked} readOnly tabIndex={-1} inputProps={{ 'aria-hidden': true }} />
  </ButtonBase>
);

interface ExportPdfConfDialogProps {
  onConfirm: (conf: ExportAreaPictureAnnotationConf) => void;
}

export const ExportPdfConfDialog: FC<ExportPdfConfDialogProps> = ({ onConfirm }) => {
  const { close } = useDialog();
  const [conf, setConf] = useState<ExportAreaPictureAnnotationConf>(DEFAULT_EXPORT_PDF_CONF);

  const selectedCount = ALL_KEYS.filter(key => conf[key]).length;
  const allSelected = selectedCount === ALL_KEYS.length;

  const toggleConf = (key: ConfKey) => setConf(prev => ({ ...prev, [key]: !prev[key] }));

  const toggleAll = () => setConf(ALL_KEYS.reduce<ExportAreaPictureAnnotationConf>((acc, key) => ({ ...acc, [key]: !allSelected }), {}));

  const handleConfirm = () => {
    onConfirm(conf);
    close();
  };

  return (
    <Box sx={ExportPdfConfDialogStyle}>
      <Box className='dialog-header'>
        <Box className='dialog-header-icon'>
          <PictureAsPdfOutlined />
        </Box>
        <Box>
          <Typography className='dialog-title'>Contenu du rapport PDF</Typography>
          <Typography className='dialog-subtitle'>Sélectionnez les sections à inclure dans l'export.</Typography>
        </Box>
      </Box>

      <Box className='dialog-toolbar'>
        <Typography className='dialog-count'>
          {selectedCount} sur {ALL_KEYS.length} sélectionnée{selectedCount > 1 ? 's' : ''}
        </Typography>
        <ButtonBase className='dialog-select-all' onClick={toggleAll}>
          {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
        </ButtonBase>
      </Box>

      <Box className='dialog-groups'>
        {GROUPS.map(({ title, keys }) => (
          <Box key={title}>
            <Typography className='group-title'>{title}</Typography>
            <Box className='group-rows'>
              {keys.map(key => (
                <ConfRow key={key} confKey={key} checked={!!conf[key]} onToggle={toggleConf} />
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      <Box className='dialog-footer'>
        <Button className='footer-btn' variant='text' color='inherit' onClick={close}>
          Annuler
        </Button>
        <Button
          className='footer-btn'
          variant='contained'
          color='primary'
          startIcon={<Download />}
          onClick={handleConfirm}
          data-testid='export-pdf-conf-confirm'
        >
          Exporter le PDF
        </Button>
      </Box>
    </Box>
  );
};
