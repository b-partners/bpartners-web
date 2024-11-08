import { useFieldArray, useForm } from 'react-hook-form';
import { Polygon } from '@bpartners/annotator-component';
import { AnnotationItem } from '@/operations/annotator';
import { mapPolygonsToAnnotationItems } from './annotation-item-mapper';

export const useAnnotationItemsForm = (defaultAnnotationItems?: AnnotationItem[]) => {
  const formState = useForm<{
    annotations: AnnotationItem[];
  }>({ defaultValues: { annotations: defaultAnnotationItems ?? [] } });

  const fieldArrayState = useFieldArray({
    control: formState.control,
    name: "annotations"
  })

  const setPolygons = (polygons: Polygon[]) => {
    const annotationInfos = fieldArrayState.fields.map(annotation => annotation.annotationInfo);
    const newPolygons = mapPolygonsToAnnotationItems(polygons, annotationInfos);
    fieldArrayState.replace(newPolygons);
  }

  const removeAnnotationByPolygonId = (polygonId: string) => {
    const polygonIndex = fieldArrayState.fields.findIndex(annotation => annotation.polygon.id === polygonId);
    if (polygonIndex !== -1) {
      fieldArrayState.remove(polygonIndex);
    }
  }

  return { formState, fieldArrayState, setPolygons, removeAnnotationByPolygonId };
};
