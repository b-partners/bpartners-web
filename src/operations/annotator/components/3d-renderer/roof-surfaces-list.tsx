import { roof3DStore } from '@/common/store';
import { Close, Edit, Polyline, Timeline } from '@mui/icons-material';
import { Box, Drawer, IconButton, MenuItem, Select, SelectChangeEvent, Stack, TextField, Typography } from '@mui/material';
import { KeyboardEvent, MouseEvent, useState } from 'react';
import { EDGE_TYPES, EDGE_TYPE_UNKNOWN_ID, getEdgeType } from './edge-types';
import { roofEdgeMenuItemStyle, roofSurfacesDrawerStyle } from './style';

export type { RoofSurfaceItem } from '@/common/store';

const PAN_COLOR_PALETTE = ['#FFB179', '#4A644E', '#2A9D8F', '#F4A261', '#7209B7', '#06D6A0', '#0096C7', '#E76F51'];

const colorForPan = (index: number) => PAN_COLOR_PALETTE[index % PAN_COLOR_PALETTE.length];

export const RoofSurfacesList = () => {
  const surfaces = roof3DStore.useRoofSurfaces();
  const selectedIndex = roof3DStore.useSelectedRoofIndex();
  const panNames = roof3DStore.usePanNames();
  const edgeTypes = roof3DStore.useEdgeTypes();
  const savedPolygons = roof3DStore.useSavedPolygons();
  const savedLines = roof3DStore.useSavedLines();
  const selectedMeasureId = roof3DStore.useSelectedMeasureId();
  const {
    setSelectedRoofIndex,
    renamePan,
    setEdgeType,
    removePolygonMeasure,
    renamePolygonMeasure,
    removeLineMeasure,
    renameLineMeasure,
    setSelectedMeasureId,
  } = roof3DStore.useRoof3DActions();

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftValue, setDraftValue] = useState('');
  const [editingMeasureId, setEditingMeasureId] = useState<string | null>(null);
  const [measureDraft, setMeasureDraft] = useState('');

  const totalMeasures = savedPolygons.length + savedLines.length;

  const startMeasureEdit = (e: MouseEvent, id: string, currentName: string) => {
    e.stopPropagation();
    setEditingMeasureId(id);
    setMeasureDraft(currentName);
  };

  const commitMeasureEdit = (type: 'polygon' | 'line') => {
    if (editingMeasureId !== null) {
      if (type === 'polygon') renamePolygonMeasure(editingMeasureId, measureDraft.trim());
      else renameLineMeasure(editingMeasureId, measureDraft.trim());
    }
    setEditingMeasureId(null);
  };

  const handleMeasureKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === 'Escape') setEditingMeasureId(null);
  };

  if (!surfaces.length && !totalMeasures) return null;

  const totalArea = surfaces.reduce((acc, s) => acc + s.area, 0);
  const selectedSurface = surfaces.find(s => s.index === selectedIndex) ?? null;
  const selectedName = selectedSurface ? panNames[selectedSurface.index]?.trim() || `Pan ${selectedSurface.index + 1}` : '';
  const selectedPolygonMeasure = savedPolygons.find(p => p.id === selectedMeasureId) ?? null;
  const selectedLineMeasure = savedLines.find(l => l.id === selectedMeasureId) ?? null;

  const startEdit = (e: MouseEvent, index: number, currentName: string) => {
    e.stopPropagation();
    setEditingIndex(index);
    setDraftValue(currentName);
  };

  const commitEdit = () => {
    if (editingIndex !== null) renamePan(editingIndex, draftValue.trim());
    setEditingIndex(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === 'Escape') setEditingIndex(null);
  };

  const handleRowClick = (index: number) => {
    setSelectedMeasureId(null);
    setSelectedRoofIndex(index === selectedIndex ? null : index);
  };

  const handleMeasureClick = (id: string) => {
    setSelectedRoofIndex(null);
    setSelectedMeasureId(id === selectedMeasureId ? null : id);
  };

  return (
    <Drawer variant='permanent' anchor='right' sx={roofSurfacesDrawerStyle} PaperProps={{ className: 'roof-drawer-paper' }}>
      {surfaces.length > 0 && (
        <>
          <Box className='roof-drawer-header'>
            <Box className='roof-drawer-header-row'>
              <Typography className='roof-drawer-title'>Pans de toit</Typography>
              <Box className='roof-drawer-count'>{surfaces.length}</Box>
            </Box>
            <Typography className='roof-drawer-total'>Surface totale : {totalArea.toFixed(2)} m²</Typography>
          </Box>

          <Stack className='roof-drawer-list'>
            {surfaces.map(({ index, area, slopeDegrees }) => {
              const isSelected = index === selectedIndex;
              const displayName = panNames[index]?.trim() || `Pan ${index + 1}`;
              const isEditing = editingIndex === index;
              return (
                <Box key={index} className={`roof-drawer-row ${isSelected ? 'selected' : ''}`} onClick={() => !isEditing && handleRowClick(index)}>
                  <Box className='roof-drawer-row-swatch' style={{ backgroundColor: colorForPan(index) }} />
                  <Box className='roof-drawer-row-info'>
                    {isEditing ? (
                      <TextField
                        autoFocus
                        size='small'
                        variant='standard'
                        value={draftValue}
                        onChange={e => setDraftValue(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={handleKeyDown}
                        onClick={e => e.stopPropagation()}
                        className='roof-drawer-row-input'
                      />
                    ) : (
                      <>
                        <Typography className='roof-drawer-row-name'>{displayName}</Typography>
                        <Typography className='roof-drawer-row-meta'>
                          {area.toFixed(2)} m² · {slopeDegrees.toFixed(1)}°
                        </Typography>
                      </>
                    )}
                  </Box>
                  {!isEditing && (
                    <IconButton size='small' className='roof-drawer-row-edit' onClick={(e: MouseEvent) => startEdit(e, index, displayName)}>
                      <Edit fontSize='inherit' />
                    </IconButton>
                  )}
                </Box>
              );
            })}
          </Stack>
        </>
      )}

      {selectedSurface && (
        <Box className='roof-drawer-detail'>
          <Box className='roof-drawer-detail-header'>
            <Box className='roof-drawer-detail-color' style={{ backgroundColor: colorForPan(selectedSurface.index) }} />
            <Typography className='roof-drawer-detail-title'>{selectedName}</Typography>
          </Box>

          <Box className='roof-drawer-detail-stats'>
            <Box className='roof-drawer-detail-stat'>
              <Typography className='roof-drawer-detail-stat-label'>Surface</Typography>
              <Typography className='roof-drawer-detail-stat-value'>{selectedSurface.area.toFixed(2)} m²</Typography>
            </Box>
            <Box className='roof-drawer-detail-stat'>
              <Typography className='roof-drawer-detail-stat-label'>Pente</Typography>
              <Typography className='roof-drawer-detail-stat-value'>{selectedSurface.slopeDegrees.toFixed(1)}°</Typography>
            </Box>
            <Box className='roof-drawer-detail-stat'>
              <Typography className='roof-drawer-detail-stat-label'>Côtés</Typography>
              <Typography className='roof-drawer-detail-stat-value'>{selectedSurface.edges.length}</Typography>
            </Box>
          </Box>

          <Typography className='roof-drawer-detail-section'>Bordures</Typography>

          {selectedSurface.edges.length === 0 ? (
            <Typography className='roof-drawer-detail-empty'>Aucun côté mesurable</Typography>
          ) : (
            <Stack className='roof-drawer-detail-edges'>
              {selectedSurface.edges.map((edge, i) => {
                const typeId = edgeTypes[selectedSurface.index]?.[i] ?? EDGE_TYPE_UNKNOWN_ID;
                return (
                  <Box key={i} className='roof-drawer-edge-row'>
                    <Select
                      size='small'
                      variant='standard'
                      disableUnderline
                      value={typeId}
                      onChange={(e: SelectChangeEvent) => setEdgeType(selectedSurface.index, i, e.target.value)}
                      className='roof-drawer-edge-type-select'
                      renderValue={(value: string) => {
                        const t = getEdgeType(value);
                        return (
                          <Box className='roof-drawer-edge-type-value'>
                            <Box className='roof-drawer-edge-color' style={{ backgroundColor: t.hex }} />
                            <Typography className='roof-drawer-edge-type-label'>{t.labelFr}</Typography>
                          </Box>
                        );
                      }}
                      MenuProps={{ PaperProps: { className: 'roof-drawer-edge-type-menu' } }}
                    >
                      {EDGE_TYPES.map(t => (
                        <MenuItem key={t.id} value={t.id} sx={roofEdgeMenuItemStyle}>
                          <Box className='roof-drawer-edge-menu-color' style={{ backgroundColor: t.hex }} />
                          <Typography className='roof-drawer-edge-menu-label'>{t.labelFr}</Typography>
                        </MenuItem>
                      ))}
                    </Select>
                    <Typography className='roof-drawer-edge-length'>{edge.distanceMeters.toFixed(2)} m</Typography>
                    <Typography className='roof-drawer-edge-slope'>{edge.slopeDegrees.toFixed(1)}°</Typography>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>
      )}

      {totalMeasures > 0 && (
        <Box className='roof-drawer-measures-section'>
          <Box className='roof-drawer-measures-header'>
            <Typography className='roof-drawer-measures-title'>Mesures</Typography>
            <Box className='roof-drawer-measures-count'>{totalMeasures}</Box>
          </Box>

          <Stack className='roof-drawer-measures-list'>
            {savedPolygons.map(polygon => {
              const isEditing = editingMeasureId === polygon.id;
              const isMeasureSelected = selectedMeasureId === polygon.id;
              return (
                <Box
                  key={polygon.id}
                  className={`roof-drawer-measure-row ${isMeasureSelected ? 'selected' : ''}`}
                  onClick={() => !isEditing && handleMeasureClick(polygon.id)}
                >
                  <Box className='roof-drawer-measure-icon' sx={{ bgcolor: '#EDE9FE', color: '#7209B7' }}>
                    <Polyline fontSize='inherit' />
                  </Box>
                  <Box className='roof-drawer-measure-info'>
                    {isEditing ? (
                      <TextField
                        autoFocus
                        size='small'
                        variant='standard'
                        value={measureDraft}
                        onChange={e => setMeasureDraft(e.target.value)}
                        onBlur={() => commitMeasureEdit('polygon')}
                        onKeyDown={handleMeasureKeyDown}
                        onClick={e => e.stopPropagation()}
                        className='roof-drawer-measure-input'
                      />
                    ) : (
                      <>
                        <Typography className='roof-drawer-measure-name'>{polygon.name}</Typography>
                        <Typography className='roof-drawer-measure-meta'>
                          {polygon.area.toFixed(2)} m² · {polygon.edges.length} côtés
                        </Typography>
                      </>
                    )}
                  </Box>
                  {!isEditing && (
                    <Box className='roof-drawer-measure-actions'>
                      <IconButton
                        size='small'
                        className='roof-drawer-measure-action-btn'
                        onClick={(e: MouseEvent) => startMeasureEdit(e, polygon.id, polygon.name)}
                      >
                        <Edit fontSize='inherit' />
                      </IconButton>
                      <IconButton size='small' className='roof-drawer-measure-delete-btn' onClick={() => removePolygonMeasure(polygon.id)}>
                        <Close fontSize='inherit' />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              );
            })}

            {savedLines.map(line => {
              const isEditing = editingMeasureId === line.id;
              const isMeasureSelected = selectedMeasureId === line.id;
              return (
                <Box
                  key={line.id}
                  className={`roof-drawer-measure-row ${isMeasureSelected ? 'selected' : ''}`}
                  onClick={() => !isEditing && handleMeasureClick(line.id)}
                >
                  <Box className='roof-drawer-measure-icon' sx={{ bgcolor: '#DBEAFE', color: '#1B6EF3' }}>
                    <Timeline fontSize='inherit' />
                  </Box>
                  <Box className='roof-drawer-measure-info'>
                    {isEditing ? (
                      <TextField
                        autoFocus
                        size='small'
                        variant='standard'
                        value={measureDraft}
                        onChange={e => setMeasureDraft(e.target.value)}
                        onBlur={() => commitMeasureEdit('line')}
                        onKeyDown={handleMeasureKeyDown}
                        onClick={e => e.stopPropagation()}
                        className='roof-drawer-measure-input'
                      />
                    ) : (
                      <>
                        <Typography className='roof-drawer-measure-name'>{line.name}</Typography>
                        <Typography className='roof-drawer-measure-meta'>
                          {line.distanceSlope.toFixed(2)} m · {line.slopeAngle.toFixed(1)}°
                        </Typography>
                      </>
                    )}
                  </Box>
                  {!isEditing && (
                    <Box className='roof-drawer-measure-actions'>
                      <IconButton size='small' className='roof-drawer-measure-action-btn' onClick={(e: MouseEvent) => startMeasureEdit(e, line.id, line.name)}>
                        <Edit fontSize='inherit' />
                      </IconButton>
                      <IconButton size='small' className='roof-drawer-measure-delete-btn' onClick={() => removeLineMeasure(line.id)}>
                        <Close fontSize='inherit' />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Stack>

          {selectedPolygonMeasure && (
            <Box className='roof-drawer-detail'>
              <Box className='roof-drawer-detail-header'>
                <Box className='roof-drawer-measure-icon' sx={{ bgcolor: '#EDE9FE', color: '#7209B7', width: 14, height: 14, fontSize: 10 }}>
                  <Polyline fontSize='inherit' />
                </Box>
                <Typography className='roof-drawer-detail-title'>{selectedPolygonMeasure.name}</Typography>
              </Box>

              <Box className='roof-drawer-detail-stats'>
                <Box className='roof-drawer-detail-stat'>
                  <Typography className='roof-drawer-detail-stat-label'>Surface</Typography>
                  <Typography className='roof-drawer-detail-stat-value'>{selectedPolygonMeasure.area.toFixed(2)} m²</Typography>
                </Box>
                <Box className='roof-drawer-detail-stat'>
                  <Typography className='roof-drawer-detail-stat-label'>Côtés</Typography>
                  <Typography className='roof-drawer-detail-stat-value'>{selectedPolygonMeasure.edges.length}</Typography>
                </Box>
              </Box>

              <Typography className='roof-drawer-detail-section'>Côtés</Typography>
              <Stack className='roof-drawer-detail-edges'>
                {selectedPolygonMeasure.edges.map((edge, i) => (
                  <Box key={i} className='roof-drawer-edge-row'>
                    <Typography className='roof-drawer-edge-type-label'>Côté {i + 1}</Typography>
                    <Typography className='roof-drawer-edge-length'>{edge.distanceSlope.toFixed(2)} m</Typography>
                    <Typography className='roof-drawer-edge-slope'>{edge.slopeAngle.toFixed(1)}°</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {selectedLineMeasure && (
            <Box className='roof-drawer-detail'>
              <Box className='roof-drawer-detail-header'>
                <Box className='roof-drawer-measure-icon' sx={{ bgcolor: '#DBEAFE', color: '#1B6EF3', width: 14, height: 14, fontSize: 10 }}>
                  <Timeline fontSize='inherit' />
                </Box>
                <Typography className='roof-drawer-detail-title'>{selectedLineMeasure.name}</Typography>
              </Box>

              <Box className='roof-drawer-detail-stats'>
                <Box className='roof-drawer-detail-stat'>
                  <Typography className='roof-drawer-detail-stat-label'>Distance</Typography>
                  <Typography className='roof-drawer-detail-stat-value'>{selectedLineMeasure.distanceSlope.toFixed(2)} m</Typography>
                </Box>
                <Box className='roof-drawer-detail-stat'>
                  <Typography className='roof-drawer-detail-stat-label'>Pente</Typography>
                  <Typography className='roof-drawer-detail-stat-value'>{selectedLineMeasure.slopeAngle.toFixed(1)}°</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Drawer>
  );
};
