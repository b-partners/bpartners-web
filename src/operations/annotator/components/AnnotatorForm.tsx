import { SlopeAndHeightState } from '@/common/fetcher';
import { annotatorStore, RoofAnalyseProperties } from '@/common/store';
import { copyObject } from '@/common/utils';
import { ANNOTATION_COVERING_CHOICES, ANNOTATION_LABELS_CHOICES, ANNOTATION_WEAR_CHOICES } from '@/constants';
import { detectionResultColors, roofGlobalIdRef } from '@/operations/prospects/constants';
import { Box, CircularProgress, MenuItem, Stack, TextField, TextFieldProps } from '@mui/material';
import { ChangeEvent, FC, FocusEvent, useEffect, useMemo, useState } from 'react';
import { AnnotationInfo } from '../types';
import { FreeAutocompleteInput } from './free-autocomplete-input';

const FormColorBox: FC<{ type: keyof typeof detectionResultColors }> = ({ type }) => (
  <Box sx={{ width: '30px', height: '25px', background: detectionResultColors[type], mr: 1, borderRadius: '5px', border: '1px solid black' }} />
);

const CustomTextField: FC<TextFieldProps & { isLoading?: boolean }> = ({ defaultValue, isLoading, ...rest }) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value);
  return <TextField {...rest} onChange={handleChange} value={isLoading ? '' : value} />;
};

type HandleChange = (
  key: keyof AnnotationInfo,
  transform?: (value: any) => any
) => (event: ChangeEvent<HTMLInputElement> | FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>) => void;

interface AnnotatorFormProps {
  polygonId: string;
  slopeAndHeightState: SlopeAndHeightState;
  isSlopeAndHeightPending: boolean;
  roofAnalyseProperties: RoofAnalyseProperties;
}
const AnnotatorForm: FC<AnnotatorFormProps> = ({ polygonId, isSlopeAndHeightPending, roofAnalyseProperties }) => {
  const { annotationInfos, updateAnnotationInfo, isFirst } = annotatorStore.useOneAnnotationStore(polygonId);

  const handleChange: HandleChange = (key, transform) => event => {
    const currentAnnotationInfo: AnnotationInfo = copyObject(annotationInfos);
    currentAnnotationInfo[key as keyof AnnotationInfo] = (transform ? transform(event.target.value) : event.target.value) as never;
    updateAnnotationInfo(currentAnnotationInfo);
  };

  const handleChangeWihoutEvent = (key: keyof AnnotationInfo, value: any) => {
    const currentAnnotationInfo: AnnotationInfo = copyObject(annotationInfos);
    currentAnnotationInfo[key] = value as never;
    updateAnnotationInfo(currentAnnotationInfo);
  };

  const percentagesLevel = useMemo(() => {
    const defaultPercentageLevel = new Array(11).fill(1).map((_e, k) => ({ id: k * 10, name: k * 10 }));
    const defaultPercentageLevelName = defaultPercentageLevel.map(({ name }) => name);

    if (!isFirst || !polygonId.includes(roofGlobalIdRef))
      return { moisissure: defaultPercentageLevel, humidite: defaultPercentageLevel, usure: defaultPercentageLevel };

    const moisissure = defaultPercentageLevelName.includes(roofAnalyseProperties?.moisissure_rate || annotationInfos.moldRate)
      ? defaultPercentageLevel
      : [
          ...defaultPercentageLevel,
          { id: roofAnalyseProperties?.moisissure_rate || annotationInfos.moldRate, name: roofAnalyseProperties?.moisissure_rate || annotationInfos.moldRate },
        ].sort((a, b) => a.name - b.name);
    const humidite = defaultPercentageLevelName.includes(roofAnalyseProperties?.humidite_rate || annotationInfos.humidityLevel)
      ? defaultPercentageLevel
      : [
          ...defaultPercentageLevel,
          {
            id: roofAnalyseProperties?.humidite_rate || annotationInfos.humidityLevel,
            name: roofAnalyseProperties?.humidite_rate || annotationInfos.humidityLevel,
          },
        ].sort((a, b) => a.name - b.name);
    const usure = defaultPercentageLevelName.includes(roofAnalyseProperties?.usure_rate || annotationInfos.wearLevel)
      ? defaultPercentageLevel
      : [
          ...defaultPercentageLevel,
          { id: roofAnalyseProperties?.usure_rate || annotationInfos.wearLevel, name: roofAnalyseProperties?.usure_rate || annotationInfos.wearLevel },
        ].sort((a, b) => a.name - b.name);

    return { moisissure, humidite, usure };
  }, [roofAnalyseProperties, isFirst]);

  return (
    <Stack gap={1}>
      <FreeAutocompleteInput
        onChange={(value: string) => handleChangeWihoutEvent('labelType', value)}
        options={ANNOTATION_LABELS_CHOICES}
        label='Type'
        defaultValue={annotationInfos.labelType}
      />
      <CustomTextField
        fullWidth
        onClick={e => e.stopPropagation()}
        label='Nom du label'
        size='small'
        defaultValue={annotationInfos.labelName}
        onBlur={handleChange('labelName')}
      />
      <FreeAutocompleteInput
        onChange={(value: string) => handleChangeWihoutEvent('covering', value)}
        options={ANNOTATION_COVERING_CHOICES}
        label='Revêtement 1'
        defaultValue={annotationInfos.covering}
      />
      <FreeAutocompleteInput
        onChange={(value: string) => handleChangeWihoutEvent('covering2', value)}
        options={ANNOTATION_COVERING_CHOICES}
        label='Revêtement 2'
        defaultValue={annotationInfos.covering2}
      />
      {
        <CustomTextField
          label={isSlopeAndHeightPending ? 'Chargement de la pente en cours...' : 'Pente (°)'}
          data-testid='pente'
          defaultValue={annotationInfos.slope || 0}
          type='number'
          inputProps={{ min: 0 }}
          onBlur={handleChange('slope', v => +`${v || 0}`)}
          disabled={isSlopeAndHeightPending}
          isLoading={isSlopeAndHeightPending}
          InputProps={
            isSlopeAndHeightPending && {
              endAdornment: <CircularProgress size={25} />,
            }
          }
        />
      }

      <TextField
        InputProps={{ startAdornment: <FormColorBox type='USURE' /> }}
        select
        label='Usure'
        value={annotationInfos.wear}
        onChange={handleChange('wear')}
        size='small'
      >
        {ANNOTATION_WEAR_CHOICES.map(({ name, id }) => (
          <MenuItem key={`${name}-wear-choices`} value={id}>
            {name}
          </MenuItem>
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
          <MenuItem key={`${name}-wearLevel`} value={id}>
            {name}
          </MenuItem>
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
          <MenuItem key={`${name}-moldRate`} value={id}>
            {name}
          </MenuItem>
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
          <MenuItem key={`${name}-humidity`} value={id}>
            {name}
          </MenuItem>
        ))}
      </TextField>

      <CustomTextField
        InputProps={{ startAdornment: <FormColorBox type='OBSTACLE' /> }}
        label='Obstacle/Velux/PV'
        defaultValue={annotationInfos.obstacle}
        onBlur={handleChange('obstacle')}
      />
      <CustomTextField
        label={polygonId.includes(roofGlobalIdRef) ? "Commentaire de l'expert" : 'Commentaire'}
        defaultValue={annotationInfos.comment}
        multiline
        onBlur={handleChange('comment')}
      />
    </Stack>
  );
};

export default AnnotatorForm;
