import { ANNOTATION_COVERING_CHOICES, ANNOTATION_WEAR_CHOICES } from '@/constants';
import { Box, Typography } from '@mui/material';
import { FC, useMemo } from 'react';
import { SelectInput, TextInput } from 'react-admin';
import SlopeSelect from './SlopeSelect';

const AnnotatorForm: FC<{ index: number; surface: number }> = ({ index, surface }) => {
  const percentagesLevel = useMemo(() => new Array(11).fill(1).map((_e, k) => ({ id: k * 10, name: k * 10 })), []);

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Typography sx={{ fontSize: '14px' }}>
        Surface : (
        <Typography component='span' fontWeight='bold'>
          {surface} m²
        </Typography>
        )
      </Typography>
      <SelectInput
        alwaysOn
        resettable
        label='Revêtement'
        choices={ANNOTATION_COVERING_CHOICES}
        name={`annotationInfos.${index}.covering`}
        source={`annotationInfos.${index}.covering`}
      />
      <SlopeSelect name={`annotationInfos.${index}.slope`} />
      <SelectInput
        sx={{ mt: 3 }}
        name={`annotationInfos.${index}.wear`}
        source={`annotationInfos.${index}.wear`}
        label='Usure'
        choices={ANNOTATION_WEAR_CHOICES}
        alwaysOn
        resettable
      />
      <SelectInput
        name={`annotationInfos.${index}.wearLevel`}
        source={`annotationInfos.${index}.wearlevel`}
        label="Taux d'usure"
        choices={percentagesLevel}
        alwaysOn
        resettable
      />
      <SelectInput
        name={`annotationInfos.${index}.moldRate`}
        source={`annotationInfos.${index}.moldRate`}
        label='Taux de moisissure'
        choices={percentagesLevel}
        alwaysOn
        resettable
      />
      <SelectInput
        name={`annotationInfos.${index}.humidityLevel`}
        source={`annotationInfos.${index}.humidityLevel`}
        label="Taux d'humidité"
        choices={percentagesLevel}
        alwaysOn
        resettable
      />
      <TextInput name={`annotationInfos.${index}.obstacle`} source={`annotationInfos.${index}.obstacle`} label='Obstacle' />
      <TextInput name={`annotationInfos.${index}.comment`} source={`annotationInfos.${index}.comment`} label='Commentaire' multiline />
    </Box>
  );
};

export default AnnotatorForm;
