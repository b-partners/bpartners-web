import { useAnnotatorComponentStore, useAnnotatorScreenSwitch } from '@/common/store';
import { ANNOTATION_2D_LABELS_CHOICES, ANNOTATION_2D_PAN_ONLY_CHOICES, ANNOTATION_ANALYSE_LABELS_CHOICES } from '@/constants';
import { FC, useMemo } from 'react';
import { SelectInput, SelectInputProps } from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';
import { AnnotatorFormState } from '../utils';

interface Props {
  index: number;
}

export const AnnotationItemLabelTypeSelect: FC<Props> = ({ index }) => {
  const { setThereIsRoofPolygon } = useAnnotatorComponentStore();
  const { screen } = useAnnotatorScreenSwitch();
  const formState = useFormContext<AnnotatorFormState>();
  const annotationInfos = useWatch({ control: formState.control, name: 'annotationInfos' });

  const choices = useMemo(() => {
    if (screen === 'roof-analyse') return ANNOTATION_ANALYSE_LABELS_CHOICES;
    const anotherRoofExists = (annotationInfos || []).some((info, i) => i !== index && info?.labelType === 'roof');
    return anotherRoofExists ? ANNOTATION_2D_PAN_ONLY_CHOICES : ANNOTATION_2D_LABELS_CHOICES;
  }, [screen, annotationInfos, index]);

  const onChange: SelectInputProps['onChange'] = event => {
    formState.setValue(`annotationInfos.${index}.labelType`, event.target.value as any);
    if (formState.getValues('annotationInfos').length !== 1) return;
    if (event.target.value === 'roof') setThereIsRoofPolygon(true);
    else setThereIsRoofPolygon(false);
  };

  return (
    <SelectInput
      size='small'
      alwaysOn
      resettable
      choices={choices}
      label='Type de label'
      sx={{ width: '70%', m: 0 }}
      name={`annotationInfos.${index}.labelType`}
      source={`annotationInfos.${index}.labelType`}
      SelectProps={{ onChange }}
    />
  );
};
