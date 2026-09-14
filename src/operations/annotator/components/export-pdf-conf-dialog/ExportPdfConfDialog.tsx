import { useDialog } from '@/common/store/dialog';
import { DEFAULT_EXPORT_PDF_CONF, EXPORT_PDF_CONF_OPTIONS } from '@/constants';
import { ExportAreaPictureAnnotationConf } from '@bpartners/typescript-client';
import { CustomPage } from '@bpartners/typescript-client';
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
  AddCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@mui/icons-material';
import { Box, Button, ButtonBase, Switch, Typography, TextField, Dialog, Stack, Tooltip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { FC, ReactNode, useState } from 'react';
import { ExportPdfConfDialogStyle } from './style';
import { CustomPageEditorDialog, CustomPageEditorDialogStyle } from './index';

type ConfKey = keyof ExportAreaPictureAnnotationConf;

const OPTION_META: Record<ConfKey, { icon: ReactNode; description: string }> = {
  showTitlePage: { icon: <DescriptionOutlined />, description: "Page de couverture avec l'adresse et les informations générales." },
  showAnnotationPages: { icon: <LayersOutlined />, description: 'Vue annotée de la toiture en 2D.' },
  showAnnotation3dPages: { icon: <ViewInArOutlined />, description: 'Rendu et annotations du modèle 3D.' },
  showLlmSummary: { icon: <AutoAwesomeOutlined />, description: "Pages du rapport généré par l'intelligence artificielle." },
  showMeasurementSummary: { icon: <StraightenOutlined />, description: 'Tableau récapitulatif des mesures relevées.' },
  showPitchSummary: { icon: <ArchitectureOutlined />, description: 'Détail des pentes par pan de toiture.' },
  showAreaSummary: { icon: <SquareFootOutlined />, description: 'Surfaces calculées par zone.' },
  showOverallSummary: { icon: <AssessmentOutlined />, description: "Synthèse générale de l'analyse." },
};

const LABEL_BY_KEY = EXPORT_PDF_CONF_OPTIONS.reduce<Record<string, string>>((acc, { key, label }) => ({ ...acc, [key]: label }), {});

const GROUPS: { title: string; keys: ConfKey[] }[] = [
  { title: 'Pages', keys: ['showTitlePage', 'showAnnotationPages', 'showAnnotation3dPages', 'showLlmSummary'] },
  { title: 'Résumés', keys: ['showMeasurementSummary', 'showPitchSummary', 'showAreaSummary', 'showOverallSummary'] },
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
  onConfirm: (payload: { conf: ExportAreaPictureAnnotationConf; customPages: CustomPage[] }) => void;
  initialCustomPages?: CustomPage[];
}

export const ExportPdfConfDialog: FC<ExportPdfConfDialogProps> = ({ onConfirm, initialCustomPages = [] }) => {
  const { close } = useDialog();
  const [conf, setConf] = useState<ExportAreaPictureAnnotationConf>(DEFAULT_EXPORT_PDF_CONF);
  const [customPages, setCustomPages] = useState<CustomPage[]>(initialCustomPages);
  const [editPageIndex, setEditPageIndex] = useState<number | null>(null);
  const [openCustomPageEditor, setOpenCustomPageEditor] = useState<boolean>(false);
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);

  const selectedCount = ALL_KEYS.filter(key => conf[key]).length;
  const allSelected = selectedCount === ALL_KEYS.length;

  const toggleConf = (key: ConfKey) => setConf(prev => ({ ...prev, [key]: !prev[key] }));

  const toggleAll = () => setConf(ALL_KEYS.reduce<ExportAreaPictureAnnotationConf>((acc, key) => ({ ...acc, [key]: !allSelected }), {}));

  const handleAddCustomPage = () => {
    setEditingPage(null);
    setOpenCustomPageEditor(true);
  };

  const handleEditCustomPage = (index: number) => {
    setEditingPage(customPages[index]);
    setEditPageIndex(index);
    setOpenCustomPageEditor(true);
  };

  const handleDeleteCustomPage = (index: number) => {
    setCustomPages(customPages.filter((_, i) => i !== index));
  };

  const handleCustomPageSave = (customPage: CustomPage) => {
    if (editPageIndex !== null) {
      // Update existing page
      const newPages = [...customPages];
      newPages[editPageIndex] = customPage;
      setCustomPages(newPages);
    } else {
      // Add new page
      setCustomPages([...customPages, customPage]);
    }
    setOpenCustomPageEditor(false);
    setEditPageIndex(null);
    setEditingPage(null);
  };

  const handleCustomPageClose = () => {
    setOpenCustomPageEditor(false);
    setEditPageIndex(null);
    setEditingPage(null);
  };

  const handleConfirm = () => {
    onConfirm({
      conf,
      customPages,
    });
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
        {/* Supplementary pages group */}
        <Box key='supplementary-pages'>
          <Typography className='group-title'>Pages supplementaires</Typography>
          <Box className='group-rows'>
            {customPages.map((page, index) => (
              <Box key={index} sx={{ border: '1px solid', borderRadius: 2, p: 1, mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant='body1' fontWeight={600}>
                    {page.pageTitle || 'Sans titre'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title='Modifier la page'>
                      <ButtonBase
                        size='small'
                        onClick={() => handleEditCustomPage(index)}
                      >
                        <EditOutlined />
                      </ButtonBase>
                    </Tooltip>
                    <Tooltip title='Supprimer la page'>
                      <ButtonBase
                        size='small'
                        onClick={() => handleDeleteCustomPage(index)}
                      >
                        <DeleteOutlined />
                      </ButtonBase>
                    </Tooltip>
                  </Box>
                </Box>
                <Box sx={{ mt: 1, fontSize: 12, color: '#6b7280' }}>
                  {page.sections.length} section{page.sections.length !== 1 ? 's' : ''}
                </Box>
              </Box>
            ))}
            <Button
              variant='outlined'
              size='small'
              startIcon={<AddCircleOutlined />}
              onClick={handleAddCustomPage}
            >
              Ajouter une page supplementaire
            </Button>
          </Box>
        </Box>
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

      {/* Custom page editor dialog */}
      <Dialog
        open={openCustomPageEditor}
        onClose={handleCustomPageClose}
        aria-labelledby='custom-page-editor-title'
        sx={CustomPageEditorDialogStyle}
      >
        <CustomPageEditorDialog
          onSave={handleCustomPageSave}
          onClose={handleCustomPageClose}
          initialData={editingPage}
        />
      </Dialog>
    </Box>
  );
};
