import { covering, wear } from '@/constants';
import { Box, Typography } from '@mui/material';
import { FC, useMemo } from 'react';
import { SelectInput, TextInput } from 'react-admin';
import SlopeSelect from './SlopeSelect';

const AnnotatorForm: FC<{ index: number; surface: number }> = ({ index, surface }) => {
  const percentagesLevel = useMemo(() => new Array(11).fill(1).map((_e, k) => ({ id: k * 10, name: k * 10 })), []);

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
        <SelectInput name={`${index}.wear`} source='wear' label='Usure' choices={wear} alwaysOn resettable />
        <SelectInput name={`${index}.wearLevel`} source='wearLevel' label="Taux d'usure" choices={percentagesLevel} alwaysOn resettable />
        <SelectInput name={`${index}.moldRate`} source='moldRate' label='Taux de moisissure' choices={percentagesLevel} alwaysOn resettable />
        <TextInput name={`${index}.obstacle`} source='obstacle' label='Obstacle' />
        <TextInput name={`${index}.comment`} source='comment' label='Commentaire' multiline />
      </div>
    </Box>
  );
};

export default AnnotatorForm;
