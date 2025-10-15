import { useAnnotatorComponentStore } from '@/common/store';
import { ANNOTATION_COVERING_CHOICES, ANNOTATION_WEAR_CHOICES } from '@/constants';
import { detectionResultColors } from '@/operations/prospects/constants';
import { Box, Divider, Typography } from '@mui/material';
import { FC, useMemo } from 'react';
import { SelectInput, TextInput } from 'react-admin';
import { useFormContext } from 'react-hook-form';

const FormColorBox: FC<{ type: keyof typeof detectionResultColors }> = ({ type }) => (
  <Box sx={{ width: '30px', height: '25px', background: detectionResultColors[type], mr: 1, borderRadius: '5px', border: '1px solid black' }} />
);

const AnnotatorForm: FC<{ index: number; surface: number }> = ({ index, surface }) => {
  const percentagesLevel = useMemo(() => new Array(11).fill(1).map((_e, k) => ({ id: k * 10, name: k * 10 })), []);
  const { getValues } = useFormContext();
  const { slopeAndHeightState, isSlopeAndHeightPending, shouldGetHeightState } = useAnnotatorComponentStore();

  const height = getValues(`annotationInfos.${index}.height`);

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {surface && (
        <Typography sx={{ fontSize: '14px' }}>
          Surface :
          <Typography component='span' fontWeight='bold'>
            {surface} m²
          </Typography>
        </Typography>
      )}
      {slopeAndHeightState?.heightStatus === 'AVAILABLE' && height && (
        <Typography sx={{ fontSize: '14px' }}>
          Hauteur du bâtiment :
          <Typography component='span' fontWeight='bold'>
            {height} m
          </Typography>
        </Typography>
      )}
      {shouldGetHeightState && !slopeAndHeightState?.heightStatus && isSlopeAndHeightPending && (
        <Typography>Chargement de la hauteur du bâtiment en cours...</Typography>
      )}
      <Divider sx={{ my: 2 }} />
      <SelectInput
        alwaysOn
        resettable
        label='Revêtement 1'
        choices={ANNOTATION_COVERING_CHOICES}
        name={`annotationInfos.${index}.covering`}
        source={`annotationInfos.${index}.covering`}
      />
      {getValues(`annotationInfos.${index}.covering2`) && (
        <SelectInput
          alwaysOn
          resettable
          label='Revêtement 2'
          choices={ANNOTATION_COVERING_CHOICES}
          name={`annotationInfos.${index}.covering2`}
          source={`annotationInfos.${index}.covering2`}
        />
      )}
      {(slopeAndHeightState?.slopeStatus || isSlopeAndHeightPending !== false) && getValues(`annotationInfos.${index}.slope`) !== -1 && (
        <TextInput type='number' inputProps={{ min: 0 }} name={`annotationInfos.${index}.slope`} source={`annotationInfos.${index}.slope`} label='Pente (%)' />
      )}
      {shouldGetHeightState && !slopeAndHeightState?.slopeStatus && isSlopeAndHeightPending && (
        <Typography paddingBottom={3}>Chargement de la pente en cours...</Typography>
      )}
      <SelectInput
        InputProps={{ startAdornment: <FormColorBox type='USURE' /> }}
        name={`annotationInfos.${index}.wear`}
        source={`annotationInfos.${index}.wear`}
        label='Usure'
        choices={ANNOTATION_WEAR_CHOICES}
        alwaysOn
        resettable
      />
      <SelectInput
        InputProps={{ startAdornment: <FormColorBox type='USURE' /> }}
        name={`annotationInfos.${index}.wearLevel`}
        source={`annotationInfos.${index}.wearLevel`}
        label="Taux d'usure"
        choices={percentagesLevel}
        alwaysOn
        resettable
      />
      <SelectInput
        InputProps={{ startAdornment: <FormColorBox type='MOISISSURE' /> }}
        name={`annotationInfos.${index}.moldRate`}
        source={`annotationInfos.${index}.moldRate`}
        label='Taux de moisissure'
        choices={percentagesLevel}
        alwaysOn
        resettable
      />
      <SelectInput
        InputProps={{ startAdornment: <FormColorBox type='HUMIDITE' /> }}
        name={`annotationInfos.${index}.humidityLevel`}
        source={`annotationInfos.${index}.humidityLevel`}
        label="Taux d'humidité"
        choices={percentagesLevel}
        alwaysOn
        resettable
      />
      <TextInput
        InputProps={{ startAdornment: <FormColorBox type='OBSTACLE' /> }}
        name={`annotationInfos.${index}.obstacle`}
        source={`annotationInfos.${index}.obstacle`}
        label='Obstacle/Velux/PV'
      />
      <TextInput name={`annotationInfos.${index}.comment`} source={`annotationInfos.${index}.comment`} label='Commentaire' multiline />
    </Box>
  );
};

export default AnnotatorForm;
