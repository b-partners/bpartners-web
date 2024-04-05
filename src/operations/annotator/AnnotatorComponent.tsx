// import annotatorLib from '@bpartners/annotator-component';
import { AnnotatorCanvas } from '@bpartners/annotator-component';
import { useCanvasAnnotationContext } from 'src/common/store/annotator/Canvas-annotation-store';
import { getUrlParams } from 'src/common/utils';

const AnnotatorComponent = () => {
  const { polygons, updatePolygonList } = useCanvasAnnotationContext();

  return (
    <AnnotatorCanvas
      allowAnnotation
      width='100%'
      height='80vh'
      image={getUrlParams(window.location.search, 'imgUrl')}
      setPolygons={updatePolygonList}
      polygonList={polygons}
      polygonLineSizeProps={{ imageName: 'Rennes_Solar_Panel_Batch_1_519355_363821.jpg', showLineSize: true }}
    />
  );
};

export default AnnotatorComponent;
