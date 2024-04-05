import { AnnotatorCanvas } from '@bpartners/annotator-component';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { useCanvasAnnotationContext } from 'src/common/store/annotator/Canvas-annotation-store';
import { getUrlParams } from 'src/common/utils';
import { annotatorProvider } from 'src/providers/annotator-provider';

const AnnotatorComponent = () => {
  const { polygons, updatePolygonList } = useCanvasAnnotationContext();
  const [{ xTile, yTile }, setTiles] = useState({ xTile: 0, yTile: 0 });

  useEffect(() => {
    const pictureId = getUrlParams(window.location.search, 'pictureId');
    annotatorProvider.getAreaPictureById(pictureId).then(pictureDetail => {
      const { xTile, yTile } = pictureDetail;
      setTiles({ xTile, yTile });
    });
  }, []);

  return (
    <Box width='100%' height='80vh' position='relative'>
      <AnnotatorCanvas
        allowAnnotation
        width='100%'
        height='80vh'
        image={getUrlParams(window.location.search, 'imgUrl')}
        setPolygons={updatePolygonList}
        polygonList={polygons}
        polygonLineSizeProps={{ imageName: `image_1_${xTile}_${yTile}.jpg`, showLineSize: true }}
      />
    </Box>
  );
};

export default AnnotatorComponent;
