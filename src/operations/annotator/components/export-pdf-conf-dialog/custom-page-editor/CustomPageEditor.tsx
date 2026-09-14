import { AddCircleOutlineOutlined, ArrowBackOutlined, DeleteOutlineOutlined } from '@mui/icons-material';
import { Box, Button, IconButton, Menu, MenuItem, TextField, Tooltip, Typography } from '@mui/material';
import { FC, MouseEvent, useState } from 'react';
import { CustomPageEditorStyle } from './style';
import {
  createCustomPage,
  createLeafSection,
  createSection,
  CustomPageDraft,
  isCustomPageValid,
  LEAF_SECTION_TYPES,
  LeafSectionDraft,
  LeafSectionType,
  SECTION_PRIORITIES,
  SECTION_PRIORITY_LABELS,
  SECTION_TYPE_LABELS,
  SECTION_TYPES,
  SectionDraft,
  SectionPriority,
  SectionType,
  TableDataDraft,
} from './types';

interface PrioritySelectProps {
  value: SectionPriority;
  onChange: (priority: SectionPriority) => void;
}

const PrioritySelect: FC<PrioritySelectProps> = ({ value, onChange }) => (
  <TextField
    className='section-priority'
    select
    size='small'
    label='Importance'
    value={value}
    onChange={event => onChange(event.target.value as SectionPriority)}
  >
    {SECTION_PRIORITIES.map(priority => (
      <MenuItem key={priority} value={priority}>
        {SECTION_PRIORITY_LABELS[priority]}
      </MenuItem>
    ))}
  </TextField>
);

interface TableFieldsProps {
  tableData: TableDataDraft;
  onChange: (tableData: TableDataDraft) => void;
}

const TableFields: FC<TableFieldsProps> = ({ tableData, onChange }) => {
  const { headers, rows } = tableData;

  const updateHeader = (index: number, value: string) => onChange({ ...tableData, headers: headers.map((header, i) => (i === index ? value : header)) });

  const updateCell = (rowIndex: number, cellIndex: number, value: string) =>
    onChange({ ...tableData, rows: rows.map((row, i) => (i === rowIndex ? row.map((cell, j) => (j === cellIndex ? value : cell)) : row)) });

  const addColumn = () => onChange({ headers: [...headers, ''], rows: rows.map(row => [...row, '']) });

  const removeColumn = () => onChange({ headers: headers.slice(0, -1), rows: rows.map(row => row.slice(0, -1)) });

  const addRow = () => onChange({ ...tableData, rows: [...rows, headers.map(() => '')] });

  const removeRow = () => onChange({ ...tableData, rows: rows.slice(0, -1) });

  return (
    <Box className='table-grid'>
      <Box className='table-line'>
        {headers.map((header, index) => (
          <TextField
            key={index}
            className='table-cell'
            size='small'
            label={`Colonne ${index + 1}`}
            value={header}
            onChange={event => updateHeader(index, event.target.value)}
          />
        ))}
      </Box>
      {rows.map((row, rowIndex) => (
        <Box key={rowIndex} className='table-line'>
          {row.map((cell, cellIndex) => (
            <TextField
              key={cellIndex}
              className='table-cell'
              size='small'
              value={cell}
              onChange={event => updateCell(rowIndex, cellIndex, event.target.value)}
            />
          ))}
        </Box>
      ))}
      <Box className='table-actions'>
        <Button className='table-action' size='small' onClick={addColumn}>
          Colonne +
        </Button>
        <Button className='table-action' size='small' onClick={removeColumn} disabled={headers.length <= 1}>
          Colonne -
        </Button>
        <Button className='table-action' size='small' onClick={addRow}>
          Ligne +
        </Button>
        <Button className='table-action' size='small' onClick={removeRow} disabled={rows.length <= 1}>
          Ligne -
        </Button>
      </Box>
    </Box>
  );
};

interface LeafSectionFieldsProps {
  section: LeafSectionDraft;
  withTypeSelect?: boolean;
  onChange: (section: LeafSectionDraft) => void;
}

const LeafSectionFields: FC<LeafSectionFieldsProps> = ({ section, withTypeSelect = false, onChange }) => (
  <Box className='section-card-fields'>
    {withTypeSelect && (
      <TextField select size='small' label='Type' value={section.type} onChange={event => onChange(createLeafSection(event.target.value as LeafSectionType))}>
        {LEAF_SECTION_TYPES.map(type => (
          <MenuItem key={type} value={type}>
            {SECTION_TYPE_LABELS[type]}
          </MenuItem>
        ))}
      </TextField>
    )}
    {section.type === 'TEXT' && (
      <TextField size='small' label='Texte' value={section.text} onChange={event => onChange({ ...section, text: event.target.value })} multiline minRows={3} />
    )}
    {section.type === 'IMAGE' && (
      <TextField size='small' label="URL de l'image" value={section.url} onChange={event => onChange({ ...section, url: event.target.value })} />
    )}
    {section.type === 'IMAGE' && (
      <TextField size='small' label='Légende' value={section.caption} onChange={event => onChange({ ...section, caption: event.target.value })} />
    )}
    {section.type === 'TABLE' && <TableFields tableData={section.tableData} onChange={tableData => onChange({ ...section, tableData })} />}
  </Box>
);

interface SectionCardProps {
  section: SectionDraft;
  index: number;
  onChange: (section: SectionDraft) => void;
  onRemove: () => void;
}

const SectionCard: FC<SectionCardProps> = ({ section, index, onChange, onRemove }) => (
  <Box className='section-card'>
    <Box className='section-card-header'>
      <Typography className='section-card-label'>
        {index + 1}. {SECTION_TYPE_LABELS[section.type]}
      </Typography>
      <PrioritySelect value={section.priority} onChange={priority => onChange({ ...section, priority })} />
      <Tooltip title='Supprimer la section'>
        <IconButton className='section-remove' size='small' onClick={onRemove} aria-label='Supprimer la section'>
          <DeleteOutlineOutlined fontSize='small' />
        </IconButton>
      </Tooltip>
    </Box>
    {(section.type === 'TEXT' || section.type === 'IMAGE' || section.type === 'TABLE') && <LeafSectionFields section={section} onChange={onChange} />}
    {section.type === 'SPLIT_SECTION' && (
      <Box className='section-panes'>
        <Box className='section-pane'>
          <Typography className='section-pane-title'>Gauche</Typography>
          <LeafSectionFields section={section.leftSection} withTypeSelect onChange={leftSection => onChange({ ...section, leftSection })} />
        </Box>
        <Box className='section-pane'>
          <Typography className='section-pane-title'>Droite</Typography>
          <LeafSectionFields section={section.rightSection} withTypeSelect onChange={rightSection => onChange({ ...section, rightSection })} />
        </Box>
      </Box>
    )}
    {section.type === 'THREE_SPLIT_SECTION' && (
      <Box className='section-panes'>
        <Box className='section-pane'>
          <Typography className='section-pane-title'>Gauche</Typography>
          <LeafSectionFields section={section.leftSection} withTypeSelect onChange={leftSection => onChange({ ...section, leftSection })} />
        </Box>
        <Box className='section-pane'>
          <Typography className='section-pane-title'>Milieu</Typography>
          <LeafSectionFields section={section.middleSection} withTypeSelect onChange={middleSection => onChange({ ...section, middleSection })} />
        </Box>
        <Box className='section-pane'>
          <Typography className='section-pane-title'>Droite</Typography>
          <LeafSectionFields section={section.rightSection} withTypeSelect onChange={rightSection => onChange({ ...section, rightSection })} />
        </Box>
      </Box>
    )}
  </Box>
);

interface CustomPageEditorProps {
  initialPage?: CustomPageDraft;
  onCancel: () => void;
  onSave: (page: CustomPageDraft) => void;
}

export const CustomPageEditor: FC<CustomPageEditorProps> = ({ initialPage, onCancel, onSave }) => {
  const [page, setPage] = useState<CustomPageDraft>(() => initialPage ?? createCustomPage());
  const [typeMenuAnchor, setTypeMenuAnchor] = useState<HTMLElement | null>(null);

  const openTypeMenu = (event: MouseEvent<HTMLButtonElement>) => setTypeMenuAnchor(event.currentTarget);

  const closeTypeMenu = () => setTypeMenuAnchor(null);

  const addSection = (type: SectionType) => {
    setPage(current => ({ ...current, sections: [...current.sections, createSection(type)] }));
    closeTypeMenu();
  };

  const updateSection = (index: number, section: SectionDraft) =>
    setPage(current => ({ ...current, sections: current.sections.map((item, i) => (i === index ? section : item)) }));

  const removeSection = (index: number) => setPage(current => ({ ...current, sections: current.sections.filter((_, i) => i !== index) }));

  return (
    <Box sx={CustomPageEditorStyle}>
      <Box className='editor-header'>
        <IconButton className='editor-back' onClick={onCancel} aria-label='Revenir au contenu du rapport'>
          <ArrowBackOutlined />
        </IconButton>
        <Box>
          <Typography className='editor-title'>Page supplémentaire</Typography>
          <Typography className='editor-subtitle'>Ajoutez un titre puis les sections à imprimer sur cette page.</Typography>
        </Box>
      </Box>

      <Box className='editor-body'>
        <TextField
          size='small'
          label='Titre de la page'
          value={page.pageTitle}
          onChange={event => setPage(current => ({ ...current, pageTitle: event.target.value }))}
          autoFocus
        />

        <Box>
          <Typography className='editor-group-title'>Sections</Typography>
          <Box className='section-list'>
            {page.sections.length === 0 && <Typography className='editor-empty'>Aucune section pour le moment.</Typography>}
            {page.sections.map((section, index) => (
              <SectionCard
                key={index}
                section={section}
                index={index}
                onChange={updated => updateSection(index, updated)}
                onRemove={() => removeSection(index)}
              />
            ))}
          </Box>
        </Box>

        <Button className='add-section' variant='outlined' size='small' startIcon={<AddCircleOutlineOutlined />} onClick={openTypeMenu}>
          Ajouter une section
        </Button>
        <Menu anchorEl={typeMenuAnchor} open={!!typeMenuAnchor} onClose={closeTypeMenu}>
          {SECTION_TYPES.map(type => (
            <MenuItem key={type} onClick={() => addSection(type)}>
              {SECTION_TYPE_LABELS[type]}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      <Box className='editor-footer'>
        <Button className='footer-btn' variant='text' color='inherit' onClick={onCancel}>
          Annuler
        </Button>
        <Button
          className='footer-btn'
          variant='contained'
          color='primary'
          onClick={() => onSave(page)}
          disabled={!isCustomPageValid(page)}
          data-testid='custom-page-save'
        >
          Enregistrer
        </Button>
      </Box>
    </Box>
  );
};
