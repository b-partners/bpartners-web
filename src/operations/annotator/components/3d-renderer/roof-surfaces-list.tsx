import { Box, Stack, Typography } from '@mui/material';
import { FC } from 'react';
import { roofSurfacesListStyle } from './style';

export interface RoofSurfaceItem {
  index: number;
  area: number;
}

interface RoofSurfacesListProps {
  surfaces: RoofSurfaceItem[];
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
}

export const RoofSurfacesList: FC<RoofSurfacesListProps> = ({ surfaces, selectedIndex, onSelect }) => {
  if (!surfaces.length) return null;

  const totalArea = surfaces.reduce((acc, s) => acc + s.area, 0);

  return (
    <Box sx={roofSurfacesListStyle}>
      <Stack className='roof-list-header'>
        <Typography className='roof-list-title'>Pans de toit</Typography>
        <Typography className='roof-list-total'>Surface totale : {totalArea.toFixed(2)} m²</Typography>
      </Stack>
      <Stack className='roof-list-items'>
        {surfaces.map(({ index, area }) => {
          const isSelected = index === selectedIndex;
          return (
            <Box
              key={index}
              className={`roof-list-item ${isSelected ? 'roof-list-item-selected' : ''}`}
              onClick={() => onSelect(isSelected ? null : index)}
            >
              <Typography className='roof-list-item-label'>Pan {index + 1}</Typography>
              <Typography className='roof-list-item-area'>{area.toFixed(2)} m²</Typography>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};
