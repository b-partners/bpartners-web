import { useAnnotatorComponentStore } from '@/common/store';
import { ANNOTATION_LABELS_CHOICES } from '@/constants';
import { FC } from 'react';
import { SelectInput, SelectInputProps } from 'react-admin';
import { useAnnotationInfosForm } from '../utils';

interface Props {
  index: number;
  formState: ReturnType<typeof useAnnotationInfosForm>['formState'];
}

export const AnnotationItemLabelTypeSelect: FC<Props> = ({ index, formState }) => {
  const { setThereIsRoofPolygon } = useAnnotatorComponentStore();

  const onChange: SelectInputProps['onChange'] = event => {
    formState.setValue(`annotationInfos.${index}.labelType`, event.target.value as any);
    if (formState.watch('annotationInfos').length !== 1) return;
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
