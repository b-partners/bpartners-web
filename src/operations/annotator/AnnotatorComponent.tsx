import { AnnotatorCanvas, Polygon } from '@bpartners/annotator-component';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { useCanvasAnnotationContext } from 'src/common/store/annotator/Canvas-annotation-store';
import { getUrlParams } from 'src/common/utils';
import { annotatorProvider } from 'src/providers/annotator-provider';

const AnnotatorComponent = ({ allowAnnotation = true, poly_gone }: { allowAnnotation: boolean, poly_gone: Polygon[] }) => {
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
    <Box width='100%' height='580px' position='relative'>
      <AnnotatorCanvas
        allowAnnotation={allowAnnotation}
        width='100%'
        height='500px'
        image={getUrlParams(window.location.search, 'imgUrl')}
        setPolygons={updatePolygonList}
        polygonList={poly_gone ? poly_gone : polygons}
        polygonLineSizeProps={{
          imageName: `image_1_${xTile}_${yTile}.jpg`,
          showLineSize: true,
          converterApiUrl: process.env.REACT_APP_ANNOTATOR_GEO_CONVERTER_API_URL || '',
        }}
      />
    </Box>
  );
};

export default AnnotatorComponent;
