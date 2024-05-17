import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { ZOOM_LEVEL } from 'src/constants/zoom-level';

interface SelectZoomLevelProps {
  newZoomLevel: string;
  handleZoomLvl: (e: SelectChangeEvent<string>) => Promise<void>;
  loading: boolean;
}

const SelectZoomLevel = ({ newZoomLevel, handleZoomLvl, loading }: SelectZoomLevelProps) => {
  return (
    <FormControl sx={{ minWidth: 300 }}>
      <InputLabel id='demo-simple-select-label'>Niveau de zoom</InputLabel>
      <Select labelId='demo-simple-select-label' id='demo-simple-select' value={newZoomLevel} label='Niveau de zoom' onChange={handleZoomLvl}>
        {loading ? (
          <MenuItem disabled>Chargement en cours...</MenuItem>
        ) : (
          ZOOM_LEVEL.map(level => (
            <MenuItem key={level.value} value={level.value}>
              {level.label}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  );
};
export default SelectZoomLevel;
