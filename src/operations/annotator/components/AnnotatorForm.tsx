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
        <SelectInput
          label='Revêtement'
          choices={covering} alwaysOn resettable
          name={`annotations.${index}.annotationInfo.covering`}
          source={`annotations.${index}.annotationInfo.covering`}
        />
        <SlopeSelect name={`annotations.${index}.annotationInfo.slope`} />
        <SelectInput
          name={`annotations.${index}.annotationInfo.wear`}
          source={`annotations.${index}.annotationInfo.wear`}
          label='Usure'
          choices={wear}
          alwaysOn
          resettable
        />
        <SelectInput name={`annotations.${index}.annotationInfo.wearLevel`} source={`annotations.${index}.annotationInfo.wearlevel`} label="Taux d'usure" choices={percentagesLevel} alwaysOn resettable />
        <SelectInput name={`annotations.${index}.annotationInfo.moldRate`} source={`annotations.${index}.annotationInfo.moldRate`} label='Taux de moisissure' choices={percentagesLevel} alwaysOn resettable />
        <TextInput name={`annotations.${index}.annotationInfo.obstacle`} source={`annotations.${index}.annotationInfo.obstacle`} label='Obstacle' />
        <TextInput name={`annotations.${index}.annotationInfo.comment`} source={`annotations.${index}.annotationInfo.comment`} label='Commentaire' multiline />
      </div>
    </Box>
  );
};

export default AnnotatorForm;
