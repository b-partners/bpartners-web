import { AnnotatorCanvas } from '@bpartners/annotator-component';
import { OpenStreetMapLayer } from '@bpartners/typescript-client';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { useCanvasAnnotationContext } from 'src/common/store/annotator/Canvas-annotation-store';
import { getUrlParams, parseUrlParams } from 'src/common/utils';
import { annotatorProvider } from 'src/providers/annotator-provider';
import SelectZoomLevel from './components/SelectZoomLevel';

const AnnotatorComponent = ({ allowAnnotation = true, poly_gone, allowSelectZoomLevel = true }: any) => {
  const { polygons, updatePolygonList } = useCanvasAnnotationContext();
  const [{ xTile, yTile }, setTiles] = useState({ xTile: 0, yTile: 0 });
  const { pictureId, prospectId, fileId } = parseUrlParams();
  const [newZoomLevel, setNewZoomLevel] = useState('HOUSES_0');
  const [fileInfo, setFileInfo] = useState({ filename: '', address: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    annotatorProvider.getAreaPictureById(pictureId).then(pictureDetail => {
      const { xTile, yTile, zoomLevel, filename, address } = pictureDetail;
      setTiles({ xTile, yTile });
      allowSelectZoomLevel && setNewZoomLevel(zoomLevel);
      setFileInfo({ filename, address });
      setLoading(false);
    });
  }, [pictureId, newZoomLevel, allowSelectZoomLevel]);

  const handleZoomLvl = async (e: any) => {
    setLoading(true);
    await annotatorProvider.getPictureFormAddress(pictureId, {
      address: fileInfo.address,
      fileId,
      filename: fileInfo.filename,
      prospectId,
      layer: OpenStreetMapLayer.tous_fr,
      zoomLevel: e.target.value,
    });
    setNewZoomLevel(e.target.value);
  };

  return (
    <Box width='100%' height='580px' position='relative'>
      {allowSelectZoomLevel && <SelectZoomLevel newZoomLevel={newZoomLevel} handleZoomLvl={handleZoomLvl} loading={loading} />}
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
