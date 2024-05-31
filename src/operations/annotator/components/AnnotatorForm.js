import { Box, Typography } from '@mui/material';
import { SelectInput, TextInput } from 'react-admin';
import { BpNumberField } from 'src/common/components';
import { covering } from 'src/constants';
import SlopeSelect from './SlopeSelect';

const AnnotatorForm = ({ index, surface }) => {
  return (
    <Box sx={{ p: 2 }}>
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box>
          Surface :
          <Typography component='span' fontWeight='bold'>
            {surface} m²
          </Typography>
        </Box>
        <SelectInput name={`${index}.covering`} source='covering' label='Revêtement' choices={covering} alwaysOn resettable />
        <SlopeSelect name={`${index}.slope`} />
        <BpNumberField name={`${index}.wearLevel`} source='wearLevel' label="Taux d'usure" />
        <TextInput name={`${index}.obstacle`} source='obstacle' label='Obstacle' />
        <TextInput name={`${index}.comment`} source='comment' label='Commentaire' multiline />
      </div>
    </Box>
  );
};

export default AnnotatorForm;
