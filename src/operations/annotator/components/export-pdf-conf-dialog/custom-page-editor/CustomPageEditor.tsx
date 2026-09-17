import { getFileUrl } from '@/common/utils';
import { FileType } from '@bpartners/typescript-client';
import {
  AddOutlined,
  ArrowBackOutlined,
  ArrowDownwardOutlined,
  ArrowUpwardOutlined,
  DeleteOutlineOutlined,
  DragIndicatorOutlined,
  FlagOutlined,
  MoreVertOutlined,
} from '@mui/icons-material';
import { Box, Button, ButtonBase, CircularProgress, IconButton, InputBase, Menu, MenuItem, Typography } from '@mui/material';
import { ChangeEvent, DragEvent, FC, KeyboardEvent, MouseEvent, ReactNode, useRef, useState } from 'react';
import { CustomPageEditorStyle } from './style';
import {
  createCustomPage,
  createLeafSection,
  createSection,
  CustomPageDraft,
  isCustomPageValid,
  isLeafSection,
  LEAF_SECTION_TYPES,
  LeafSectionDraft,
  SECTION_PRIORITIES,
  SECTION_PRIORITY_LABELS,
  SECTION_TYPE_LABELS,
  SECTION_TYPES,
  SectionDraft,
  SectionType,
  SplitSectionDraft,
  TableDataDraft,
  ThreeSplitSectionDraft,
} from './types';

interface BlockAction {
  key: string;
  label: string;
  selected?: boolean;
  onSelect: () => void;
}

interface BlockMenuProps {
  ariaLabel: string;
  actions: BlockAction[];
  icon?: ReactNode;
}

const BlockMenu: FC<BlockMenuProps> = ({ ariaLabel, actions, icon = <MoreVertOutlined fontSize='small' /> }) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const closeMenu = () => setAnchor(null);

  const select = (action: BlockAction) => {
    action.onSelect();
    closeMenu();
  };

  return (
    <>
      <IconButton className='block-menu' size='small' aria-label={ariaLabel} onClick={(event: MouseEvent<HTMLButtonElement>) => setAnchor(event.currentTarget)}>
        {icon}
      </IconButton>
      <Menu anchorEl={anchor} open={!!anchor} onClose={closeMenu}>
        {actions.map(action => (
          <MenuItem key={action.key} selected={action.selected} onClick={() => select(action)}>
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

interface TableContentProps {
  tableData: TableDataDraft;
  onChange: (tableData: TableDataDraft) => void;
}

const TableContent: FC<TableContentProps> = ({ tableData, onChange }) => {
  const { headers, rows } = tableData;

  const updateHeader = (index: number, value: string) => onChange({ ...tableData, headers: headers.map((header, i) => (i === index ? value : header)) });

  const updateCell = (rowIndex: number, cellIndex: number, value: string) =>
    onChange({ ...tableData, rows: rows.map((row, i) => (i === rowIndex ? row.map((cell, j) => (j === cellIndex ? value : cell)) : row)) });

  return (
    <Box>
      <table className='render-table'>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={`header-${index}`}>
                <InputBase
                  placeholder={`Colonne ${index + 1}`}
                  value={header}
                  onChange={event => updateHeader(index, event.target.value)}
                  fullWidth
                  multiline
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`cell-${cellIndex}`}>
                  <InputBase value={cell} onChange={event => updateCell(rowIndex, cellIndex, event.target.value)} fullWidth multiline />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Box className='table-controls'>
        <ButtonBase className='table-control' onClick={() => onChange({ headers: [...headers, ''], rows: rows.map(row => [...row, '']) })}>
          Ajouter une colonne
        </ButtonBase>
        <ButtonBase
          className='table-control'
          disabled={headers.length <= 1}
          onClick={() => onChange({ headers: headers.slice(0, -1), rows: rows.map(row => row.slice(0, -1)) })}
        >
          Retirer une colonne
        </ButtonBase>
        <ButtonBase className='table-control' onClick={() => onChange({ ...tableData, rows: [...rows, headers.map(() => '')] })}>
          Ajouter une ligne
        </ButtonBase>
        <ButtonBase className='table-control' disabled={rows.length <= 1} onClick={() => onChange({ ...tableData, rows: rows.slice(0, -1) })}>
          Retirer une ligne
        </ButtonBase>
      </Box>
    </Box>
  );
};

interface LeafContentProps {
  section: LeafSectionDraft;
  onChange: (section: LeafSectionDraft) => void;
}

const LeafContent: FC<LeafContentProps> = ({ section, onChange }) => {
  const [urlDraft, setUrlDraft] = useState('');
  const [isUrlOpen, setIsUrlOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const priorityClass = `prio-${section.priority.toLowerCase()}`;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || section.type !== 'IMAGE') return;

    const previewUrl = URL.createObjectURL(file);
    onChange({ ...section, url: previewUrl, fileId: undefined });
    setIsUrlOpen(false);
    event.target.value = '';
  };

  if (section.type === 'TEXT') {
    return (
      <InputBase
        className={`block-text ${priorityClass}`}
        placeholder='Saisissez votre texte…'
        value={section.text}
        onChange={event => onChange({ ...section, text: event.target.value })}
        fullWidth
        multiline
      />
    );
  }

  if (section.type === 'TABLE') {
    return <TableContent tableData={section.tableData} onChange={tableData => onChange({ ...section, tableData })} />;
  }

  const openUrl = () => {
    setUrlDraft(section.url);
    setIsUrlOpen(true);
  };

  const commitUrl = () => {
    const url = urlDraft.trim();
    onChange({ ...section, url, fileId: url === section.url ? section.fileId : undefined });
    setIsUrlOpen(false);
  };

  const onUrlKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === 'Enter') commitUrl();
    if (event.key === 'Escape') setIsUrlOpen(false);
  };

  if (isUrlOpen || !section.url) {
    return (
      <Box className={`block-image ${priorityClass}`}>
        <Box className='image-drop'>
          {isUrlOpen ? (
            <InputBase
              className='image-url'
              placeholder="Collez l'URL de l'image puis appuyez sur Entrée"
              value={urlDraft}
              onChange={event => setUrlDraft(event.target.value)}
              onBlur={commitUrl}
              onKeyDown={onUrlKeyDown}
              autoFocus
              fullWidth
            />
          ) : (
            <Box className='image-drop-target'>
              <input ref={fileInputRef} type='file' accept='image/*' hidden onChange={handleFileChange} />
              <ButtonBase className='image-choice' onClick={() => fileInputRef.current?.click()} aria-label='Téléverser une image'>
                <AddOutlined />
                <Typography className='image-drop-label'>Téléverser une image</Typography>
              </ButtonBase>
              <ButtonBase className='image-choice' onClick={openUrl} aria-label='Ajouter une image par URL'>
                <Typography className='image-drop-label'>Coller un lien</Typography>
              </ButtonBase>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box className={`block-image ${priorityClass}`}>
      <ButtonBase className='image-frame' onClick={openUrl} aria-label="Remplacer l'image">
        <img
          className='image-preview'
          src={section.fileId ? getFileUrl(section.fileId, FileType.AREA_PICTURE) : section.url}
          alt={section.caption || 'Illustration de la page'}
        />
      </ButtonBase>
      <InputBase
        className='image-caption'
        placeholder='Légende (facultatif)'
        value={section.caption}
        onChange={event => onChange({ ...section, caption: event.target.value })}
        fullWidth
      />
    </Box>
  );
};

interface ColumnsContentProps {
  section: SplitSectionDraft | ThreeSplitSectionDraft;
  onChange: (section: SectionDraft) => void;
}

const ColumnsContent: FC<ColumnsContentProps> = ({ section, onChange }) => {
  const panes =
    section.type === 'SPLIT_SECTION'
      ? [
          { title: 'Gauche', leaf: section.leftSection, set: (leaf: LeafSectionDraft) => onChange({ ...section, leftSection: leaf }) },
          { title: 'Droite', leaf: section.rightSection, set: (leaf: LeafSectionDraft) => onChange({ ...section, rightSection: leaf }) },
        ]
      : [
          { title: 'Gauche', leaf: section.leftSection, set: (leaf: LeafSectionDraft) => onChange({ ...section, leftSection: leaf }) },
          { title: 'Milieu', leaf: section.middleSection, set: (leaf: LeafSectionDraft) => onChange({ ...section, middleSection: leaf }) },
          { title: 'Droite', leaf: section.rightSection, set: (leaf: LeafSectionDraft) => onChange({ ...section, rightSection: leaf }) },
        ];

  const addColumn = () =>
    onChange({
      type: 'THREE_SPLIT_SECTION',
      priority: section.priority,
      leftSection: section.leftSection,
      middleSection: createLeafSection('TEXT'),
      rightSection: section.rightSection,
    });

  const removeColumn = () => {
    if (section.type !== 'THREE_SPLIT_SECTION') return;
    onChange({ type: 'SPLIT_SECTION', priority: section.priority, leftSection: section.leftSection, rightSection: section.rightSection });
  };

  return (
    <Box>
      <Box className='block-columns' style={{ gridTemplateColumns: panes.length === 2 ? '49% 49%' : '32% 32% 32%' }}>
        {panes.map(pane => (
          <Box key={pane.title} className='column'>
            <Box className='column-toolbar'>
              <BlockMenu
                ariaLabel={`Type du bloc ${pane.title}`}
                actions={LEAF_SECTION_TYPES.map(type => ({
                  key: type,
                  label: SECTION_TYPE_LABELS[type],
                  selected: pane.leaf.type === type,
                  onSelect: () => pane.set(createLeafSection(type)),
                }))}
              />
              <BlockMenu
                ariaLabel={`Niveau d'importance du bloc ${pane.title}`}
                icon={<FlagOutlined fontSize='small' />}
                actions={SECTION_PRIORITIES.map(priority => ({
                  key: priority,
                  label: SECTION_PRIORITY_LABELS[priority],
                  selected: pane.leaf.priority === priority,
                  onSelect: () => pane.set({ ...pane.leaf, priority }),
                }))}
              />
              <IconButton
                className='block-menu'
                size='small'
                aria-label={`Vider le bloc ${pane.title}`}
                onClick={() => pane.set({ ...createLeafSection(pane.leaf.type), priority: pane.leaf.priority })}
              >
                <DeleteOutlineOutlined fontSize='small' />
              </IconButton>
            </Box>
            <LeafContent section={pane.leaf} onChange={pane.set} />
          </Box>
        ))}
      </Box>
      <Box className='column-count-controls'>
        <ButtonBase className='table-control' disabled={panes.length >= 3} onClick={addColumn}>
          Ajouter une colonne
        </ButtonBase>
        <ButtonBase className='table-control' disabled={panes.length <= 2} onClick={removeColumn}>
          Retirer une colonne
        </ButtonBase>
      </Box>
    </Box>
  );
};

interface SectionBlockProps {
  section: SectionDraft;
  onChange: (section: SectionDraft) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  isDragging: boolean;
  isDropTarget: boolean;
}

const SectionBlock: FC<SectionBlockProps> = ({
  section,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragging,
  isDropTarget,
}) => {
  const blockRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', '');
    if (blockRef.current) event.dataTransfer.setDragImage(blockRef.current, 20, 20);
    onDragStart();
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    onDragOver();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    onDrop();
  };

  return (
    <Box
      ref={blockRef}
      className={`block ${isDragging ? 'block-dragging' : ''} ${isDropTarget ? 'block-drop-target' : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Box className='block-move-controls'>
        <Box className='block-drag-handle' draggable onDragStart={handleDragStart} onDragEnd={onDragEnd} role='button' aria-label='Déplacer le bloc'>
          <DragIndicatorOutlined fontSize='small' />
        </Box>
        <IconButton className='block-move' size='small' aria-label='Monter le bloc' disabled={!canMoveUp} onClick={onMoveUp}>
          <ArrowUpwardOutlined fontSize='small' />
        </IconButton>
        <IconButton className='block-move' size='small' aria-label='Descendre le bloc' disabled={!canMoveDown} onClick={onMoveDown}>
          <ArrowDownwardOutlined fontSize='small' />
        </IconButton>
      </Box>
      <Box className='block-toolbar'>
        <BlockMenu
          ariaLabel={`Niveau d'importance du bloc ${SECTION_TYPE_LABELS[section.type]}`}
          icon={<FlagOutlined fontSize='small' />}
          actions={SECTION_PRIORITIES.map(priority => ({
            key: priority,
            label: SECTION_PRIORITY_LABELS[priority],
            selected: section.priority === priority,
            onSelect: () => onChange({ ...section, priority }),
          }))}
        />
        <IconButton className='block-menu' size='small' aria-label='Supprimer le bloc' onClick={onRemove}>
          <DeleteOutlineOutlined fontSize='small' />
        </IconButton>
      </Box>
      {isLeafSection(section) ? <LeafContent section={section} onChange={onChange} /> : <ColumnsContent section={section} onChange={onChange} />}
    </Box>
  );
};

interface CustomPageEditorProps {
  initialPage?: CustomPageDraft;
  onCancel: () => void;
  onSave: (page: CustomPageDraft) => void;
  isSaving?: boolean;
}

export const CustomPageEditor: FC<CustomPageEditorProps> = ({ initialPage, onCancel, onSave, isSaving }) => {
  const [page, setPage] = useState<CustomPageDraft>(() => initialPage ?? createCustomPage());
  const [paletteAnchor, setPaletteAnchor] = useState<HTMLElement | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const closePalette = () => setPaletteAnchor(null);

  const addSection = (type: SectionType) => {
    setPage(current => ({ ...current, sections: [...current.sections, createSection(type)] }));
    closePalette();
  };

  const updateSection = (index: number, section: SectionDraft) =>
    setPage(current => ({ ...current, sections: current.sections.map((item, i) => (i === index ? section : item)) }));

  const removeSection = (index: number) => setPage(current => ({ ...current, sections: current.sections.filter((_, i) => i !== index) }));

  const reorderSections = (fromIndex: number, toIndex: number) =>
    setPage(current => {
      if (fromIndex === toIndex || toIndex < 0 || toIndex >= current.sections.length) return current;

      const sections = [...current.sections];
      const [moved] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, moved);
      return { ...current, sections };
    });

  const endDrag = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex !== null) reorderSections(draggedIndex, index);
    endDrag();
  };

  return (
    <Box sx={CustomPageEditorStyle}>
      <Box className='editor-bar'>
        <IconButton className='editor-back' onClick={onCancel} aria-label='Revenir au contenu du rapport'>
          <ArrowBackOutlined />
        </IconButton>
        <Typography className='editor-heading'>Page supplémentaire</Typography>
        <Button className='bar-btn' variant='text' color='inherit' onClick={onCancel}>
          Annuler
        </Button>
        <Button
          className='bar-btn'
          variant='contained'
          color='primary'
          onClick={() => onSave(page)}
          disabled={!isCustomPageValid(page) || isSaving}
          startIcon={isSaving ? <CircularProgress size={14} color='inherit' /> : undefined}
          data-testid='custom-page-save'
        >
          Enregistrer
        </Button>
      </Box>

      <Box className='editor-canvas'>
        <Box className='page-sheet'>
          <InputBase
            className='page-title'
            placeholder='Titre de la page'
            value={page.pageTitle}
            onChange={event => setPage(current => ({ ...current, pageTitle: event.target.value }))}
            autoFocus
            fullWidth
            multiline
          />

          {page.sections.length === 0 && <Typography className='page-hint'>Cette page est vide. Ajoutez un bloc pour commencer à la remplir.</Typography>}

          <Box className='blocks'>
            {page.sections.map((section, index) => (
              <SectionBlock
                key={index}
                section={section}
                onChange={updated => updateSection(index, updated)}
                onRemove={() => removeSection(index)}
                onMoveUp={() => reorderSections(index, index - 1)}
                onMoveDown={() => reorderSections(index, index + 1)}
                canMoveUp={index > 0}
                canMoveDown={index < page.sections.length - 1}
                onDragStart={() => setDraggedIndex(index)}
                onDragEnd={endDrag}
                onDragOver={() => draggedIndex !== null && draggedIndex !== index && setDragOverIndex(index)}
                onDrop={() => handleDrop(index)}
                isDragging={draggedIndex === index}
                isDropTarget={dragOverIndex === index}
              />
            ))}
          </Box>

          <ButtonBase
            className='add-block'
            onClick={(event: MouseEvent<HTMLButtonElement>) => setPaletteAnchor(event.currentTarget)}
            data-testid='add-custom-page-block'
          >
            <AddOutlined fontSize='small' />
            Ajouter un bloc
          </ButtonBase>
          <Menu anchorEl={paletteAnchor} open={!!paletteAnchor} onClose={closePalette}>
            {SECTION_TYPES.map(type => (
              <MenuItem key={type} onClick={() => addSection(type)}>
                {SECTION_TYPE_LABELS[type]}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>
    </Box>
  );
};
