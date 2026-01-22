import { annotatorStore, useAnnotatorComponentStore } from '@/common/store';
import { copyObject } from '@/common/utils';
import { ANNOTATION_COVERING_CHOICES, ANNOTATION_LABELS_CHOICES, ANNOTATION_WEAR_CHOICES } from '@/constants';
import { detectionResultColors, roofGlobalIdRef } from '@/operations/prospects/constants';
import { Box, MenuItem, Stack, TextField, TextFieldProps, Typography } from '@mui/material';
import { ChangeEvent, FC, FocusEvent, useMemo, useState } from 'react';
import { AnnotationInfo } from '../types';

const FormColorBox: FC<{ type: keyof typeof detectionResultColors }> = ({ type }) => (
  <Box sx={{ width: '30px', height: '25px', background: detectionResultColors[type], mr: 1, borderRadius: '5px', border: '1px solid black' }} />
);

const CustomTextField: FC<TextFieldProps> = props => {
  const [value, setValue] = useState(props.defaultValue);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value);
  return <TextField {...props} onChange={handleChange} value={value} />;
};

type HandleChange = (
  key: keyof AnnotationInfo,
  transform?: (value: any) => any
) => (event: ChangeEvent<HTMLInputElement> | FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>) => void;

const AnnotatorForm: FC<{ surface: number; polygonId: string }> = ({ surface, polygonId }) => {
  const { annotationInfos, updateAnnotationInfo, isFirst } = annotatorStore.useOneAnnotationStore(polygonId);
  const { slopeAndHeightState, isSlopeAndHeightPending, roofAnalyseProperties } = useAnnotatorComponentStore();

  const handleChange: HandleChange = (key, transform) => event => {
    const currentAnnotationInfo: AnnotationInfo = copyObject(annotationInfos);
    currentAnnotationInfo[key as keyof AnnotationInfo] = (transform ? transform(event.target.value) : event.target.value) as never;
    updateAnnotationInfo(currentAnnotationInfo);
  };

  const height = annotationInfos.height;

  const percentagesLevel = useMemo(() => {
    const defaultPercentageLevel = new Array(11).fill(1).map((_e, k) => ({ id: k * 10, name: k * 10 }));
    const defaultPercentageLevelName = defaultPercentageLevel.map(({ name }) => name);

    if (!isFirst || !polygonId.includes(roofGlobalIdRef))
      return { moisissure: defaultPercentageLevel, humidite: defaultPercentageLevel, usure: defaultPercentageLevel };

    const moisissure = defaultPercentageLevelName.includes(roofAnalyseProperties?.moisissure_rate)
      ? defaultPercentageLevel
      : [...defaultPercentageLevel, { id: roofAnalyseProperties?.moisissure_rate, name: roofAnalyseProperties?.moisissure_rate }].sort(
          (a, b) => a.name - b.name
        );
    const humidite = defaultPercentageLevelName.includes(roofAnalyseProperties?.humidite_rate)
      ? defaultPercentageLevel
      : [...defaultPercentageLevel, { id: roofAnalyseProperties?.humidite_rate, name: roofAnalyseProperties?.humidite_rate }].sort((a, b) => a.name - b.name);
    const usure = defaultPercentageLevelName.includes(roofAnalyseProperties?.usure_rate)
      ? defaultPercentageLevel
      : [...defaultPercentageLevel, { id: roofAnalyseProperties?.usure_rate, name: roofAnalyseProperties?.usure_rate }].sort((a, b) => a.name - b.name);

    return { moisissure, humidite, usure };
  }, [roofAnalyseProperties, isFirst]);

  return (
    <Stack gap={1}>
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
      {isSlopeAndHeightPending && <Typography>Chargement de la hauteur du bâtiment en cours...</Typography>}

      <TextField fullWidth value={annotationInfos.labelType} select size='small' label='Type' onChange={handleChange('labelType')}>
        {ANNOTATION_LABELS_CHOICES.map(({ id, name }) => (
          <MenuItem key={name} value={id}>
            {name}
          </MenuItem>
        ))}
      </TextField>
      <CustomTextField
        fullWidth
        onClick={e => e.stopPropagation()}
        label='Nom du label'
        size='small'
        defaultValue={annotationInfos.labelName}
        onBlur={handleChange('labelName')}
      />
      <TextField select label='Revêtement 1' value={annotationInfos.covering} onChange={handleChange('covering')} size='small'>
        {ANNOTATION_COVERING_CHOICES.map(({ name, id }) => (
          <MenuItem value={id}>{name}</MenuItem>
        ))}
      </TextField>
      {annotationInfos.covering2 && (
        <TextField select label='Revêtement 2' value={annotationInfos.covering2} onChange={handleChange('covering2')} size='small'>
          {ANNOTATION_COVERING_CHOICES.map(({ name, id }) => (
            <MenuItem value={id}>{name}</MenuItem>
          ))}
        </TextField>
      )}

      {(slopeAndHeightState?.slopeStatus || isSlopeAndHeightPending !== false) && annotationInfos.slope !== -1 && (
        <CustomTextField
          label='Pente (°)'
          defaultValue={annotationInfos.slope}
          type='number'
          inputProps={{ min: 0 }}
          onBlur={handleChange('slope', v => +`${v || 0}`)}
        />
      )}

      {isSlopeAndHeightPending && <Typography paddingBottom={3}>Chargement de la pente en cours...</Typography>}

      <TextField
        InputProps={{ startAdornment: <FormColorBox type='USURE' /> }}
        select
        label='Usure'
        value={annotationInfos.wear}
        onChange={handleChange('wear')}
        size='small'
      >
        {ANNOTATION_WEAR_CHOICES.map(({ name, id }) => (
          <MenuItem value={id}>{name}</MenuItem>
        ))}
      </TextField>
      <TextField
        InputProps={{ startAdornment: <FormColorBox type='USURE' /> }}
        select
        label="Taux d'usure"
        value={annotationInfos.wearLevel}
        onChange={handleChange('wearLevel')}
        size='small'
      >
        {percentagesLevel.usure.map(({ name, id }) => (
          <MenuItem value={id}>{name}</MenuItem>
        ))}
      </TextField>
      <TextField
        InputProps={{ startAdornment: <FormColorBox type='MOISISSURE' /> }}
        select
        label='Taux de moisissure'
        value={annotationInfos.moldRate}
        onChange={handleChange('moldRate')}
        size='small'
      >
        {percentagesLevel.moisissure.map(({ name, id }) => (
          <MenuItem value={id}>{name}</MenuItem>
        ))}
      </TextField>
      <TextField
        InputProps={{ startAdornment: <FormColorBox type='HUMIDITE' /> }}
        select
        label="Taux d'humidité"
        value={annotationInfos.humidityLevel}
        onChange={handleChange('humidityLevel')}
        size='small'
      >
        {percentagesLevel.humidite.map(({ name, id }) => (
          <MenuItem value={id}>{name}</MenuItem>
        ))}
      </TextField>

      <CustomTextField
        InputProps={{ startAdornment: <FormColorBox type='OBSTACLE' /> }}
        label='Obstacle/Velux/PV'
        defaultValue={annotationInfos.obstacle}
        onBlur={handleChange('obstacle')}
      />
      <CustomTextField label='Commentaire' defaultValue={annotationInfos.comment} multiline onBlur={handleChange('comment')} />
    </Stack>
  );
};

export default AnnotatorForm;
