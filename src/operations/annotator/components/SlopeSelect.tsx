import { Info } from '@mui/icons-material';
import { FormControl, IconButton, InputLabel, MenuItem, Select, Tooltip } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { useCanvasAnnotationContext } from 'src/common/store/annotator/Canvas-annotation-store';
import PENTES from 'src/constants/slope-images';

const SlopeSelect = ({ name }: { name: string }) => {
  const { register, setValue } = useFormContext();
  const value = useWatch({ name });
  const { handleSlopeInfoToggle } = useCanvasAnnotationContext();

  const handleChange = (event: any) => {
    setValue(name, event.target.value as number);
  };

  return (
    <FormControl fullWidth>
      <InputLabel id='demo-simple-select-label'>Pente</InputLabel>
      <Select
        labelId='demo-simple-select-label'
        id='demo-simple-select'
        value={value || 0}
        label='Pente'
        onChange={handleChange}
        {...register(name)}
        MenuProps={{
          sx: {
            '& ul': {
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
            },
          },
        }}
      >
        {PENTES.map((slope, key) => {
          return (
            <MenuItem value={slope.value} key={key}>
              <Tooltip title={slope.title}>
                <img width={'50px'} src={slope.url} alt={slope.title} />
              </Tooltip>
            </MenuItem>
          );
        })}
      </Select>
      <IconButton
        onClick={handleSlopeInfoToggle}
        sx={{
          position: 'absolute',
          right: '12%',
          top: '10%',
        }}
      >
        <Info />
      </IconButton>
    </FormControl>
  );
};

export default SlopeSelect;
