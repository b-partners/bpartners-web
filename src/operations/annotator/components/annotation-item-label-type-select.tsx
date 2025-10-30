import { useAnnotatorComponentStore } from '@/common/store';
import { ANNOTATION_LABELS_CHOICES } from '@/constants';
import { FC } from 'react';
import { SelectInput, SelectInputProps } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { AnnotatorFormState } from '../utils';

interface Props {
  index: number;
}

export const AnnotationItemLabelTypeSelect: FC<Props> = ({ index }) => {
  const { setThereIsRoofPolygon } = useAnnotatorComponentStore();
  const formState = useFormContext<AnnotatorFormState>();

  const onChange: SelectInputProps['onChange'] = event => {
    formState.setValue(`annotationInfos.${index}.labelType`, event.target.value as any);
    if (formState.getValues('annotationInfos').length !== 1) return;
    if (event.target.value === 'roof') setThereIsRoofPolygon(true);
    else setThereIsRoofPolygon(false);
  };

  return (
    <SelectInput
      alwaysOn
      resettable
      choices={ANNOTATION_LABELS_CHOICES}
      label='Type de label'
      sx={{ width: '70%', m: 0 }}
      name={`annotationInfos.${index}.labelType`}
      source={`annotationInfos.${index}.labelType`}
      SelectProps={{ onChange }}
    />
  );
};
