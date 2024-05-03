import { ZoomLevel } from '@bpartners/typescript-client';
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';

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
          Object.values(ZoomLevel).map(level => (
            <MenuItem key={level} value={level}>
              {level}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  );
};
export default SelectZoomLevel;
