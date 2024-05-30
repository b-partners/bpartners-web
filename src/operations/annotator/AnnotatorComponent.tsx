import { AnnotatorCanvas } from '@bpartners/annotator-component';
import { AreaPictureMapLayer, CrupdateAreaPictureDetails, ZoomLevel } from '@bpartners/typescript-client';
import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import { BPButton } from 'src/common/components/BPButton';
import BpSelect from 'src/common/components/BpSelect';
import { useCanvasAnnotationContext } from 'src/common/store/annotator/Canvas-annotation-store';
import { getUrlParams, parseUrlParams } from 'src/common/utils';
import { ZOOM_LEVEL } from 'src/constants/zoom-level';
import { annotatorProvider } from 'src/providers/annotator-provider';

const AnnotatorComponent = ({ allowAnnotation = true, poly_gone, allowSelect = true, width }: any) => {
  const { polygons, updatePolygonList } = useCanvasAnnotationContext();
  const { pictureId, prospectId, fileId } = parseUrlParams();
  const [newZoomLevel, setNewZoomLevel] = useState<ZoomLevel>(ZoomLevel.HOUSES_0);
  const [newzoomLevelAsNumber, setNewZoomLevelAsNumber] = useState(20);
  const [fileInfo, setFileInfo] = useState({ filename: '', address: '' });
  const [loading, setLoading] = useState({
    zoomLvl: false,
    layer: false,
    refocusImg: false,
  });
  const [layer, setLayer] = useState<AreaPictureMapLayer>({});
  const [otherLayers, setOtherLayers] = useState([]);
  const [changing, setChanging] = useState(false);
  const [isExtended, setIsExtended] = useState(false);

  const notify = useNotify();

  useEffect(() => {
    annotatorProvider.getAreaPictureById(pictureId).then(pictureDetail => {
      const { filename, address, zoom, actualLayer, otherLayers, isExtended } = pictureDetail;

      if (allowSelect) {
        setNewZoomLevel(zoom.level);
        setNewZoomLevelAsNumber(zoom.number);
      }
      //
      setLayer(actualLayer);
      setOtherLayers(otherLayers);
      setFileInfo({ filename, address });
      setIsExtended(isExtended);
    });
  }, [pictureId, newZoomLevel, allowSelect, changing]);

  const handleAction = async (actionType: string, fetchParams: CrupdateAreaPictureDetails, updateState: () => void) => {
    try {
      setLoading(prev => ({ ...prev, [actionType]: true }));
      await annotatorProvider.getPictureFormAddress(pictureId, fetchParams);
      updateState();
    } catch (error) {
      notify('messages.global.error', { type: 'error' });
    } finally {
      setLoading(prev => ({ ...prev, [actionType]: false }));
    }
  };
  const handleZoomLvl = async (e: any) => {
    const selectedZoom = ZOOM_LEVEL.find(level => level.value === e.target.value);

    const fetchParams = {
      address: fileInfo.address,
      fileId,
      filename: fileInfo.filename,
      prospectId,
      zoomLevel: e.target.value,
    };

    const updateState = () => {
      setNewZoomLevel(e.target.value);
      setNewZoomLevelAsNumber(selectedZoom.lvl);
    };

    handleAction('zoomLvl', fetchParams, updateState);
  };

  const handleLayerChanger = async (e: any) => {
    const selectedLayer = otherLayers.find(layer => layer.name === e.target.value);

    const fetchParams = {
      address: fileInfo.address,
      fileId,
      filename: fileInfo.filename,
      prospectId,
      zoomLevel: newZoomLevel,
      layerId: selectedLayer.id,
    };

    const updateState = () => {
      setLayer(selectedLayer);
      setChanging(!changing);
    };

    handleAction('layer', fetchParams, updateState);
  };

  const refocusImgClick = async () => {
    if (isExtended) {
      notify('Cette image a déjà été Recentrer', { type: 'warning' });
      return;
    }

    const fetchParams = {
      address: fileInfo.address,
      fileId,
      filename: fileInfo.filename,
      prospectId,
      zoomLevel: newZoomLevel,
      isExtended: true,
    };

    const updateState = () => {
      setChanging(!changing);
    };

    handleAction('refocusImg', fetchParams, updateState);
  };

  return (
    <Box width='100%' height='580px' position='relative'>
      {allowSelect && (
        <>
          <BpSelect
            value={newZoomLevel}
            handleChange={handleZoomLvl}
            loading={loading.zoomLvl}
            options={ZOOM_LEVEL}
            getOptionKey={(option: any) => option.lvl}
            getOptionValue={(option: any) => option.value}
            getOptionLabel={(option: any) => option.label}
            label='Niveau de zoom'
          />
          <BpSelect
            value={layer.name || ''}
            handleChange={handleLayerChanger}
            loading={loading.layer}
            options={otherLayers}
            getOptionKey={(option: AreaPictureMapLayer) => option.id}
            getOptionValue={(option: AreaPictureMapLayer) => option.name}
            getOptionLabel={(option: AreaPictureMapLayer) => `${option.name} ${option.year} ${option.precisionLevelInCm}cm`}
            label="Source d'image"
          />
          <BPButton
            type='button'
            onClick={refocusImgClick}
            data-testid='center-img-btn'
            label="Recenter l'image"
            style={{
              width: '200px',
              height: '50px',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '7px',
            }}
            isLoading={loading.refocusImg}
          />
        </>
      )}
      {fileInfo.filename && (
        <AnnotatorCanvas
          allowAnnotation={allowAnnotation}
          width={width || '100%'}
          height='500px'
          image={getUrlParams(window.location.search, 'imgUrl')}
          setPolygons={updatePolygonList}
          polygonList={poly_gone ? poly_gone : polygons}
          polygonLineSizeProps={{
            imageName: `${fileInfo.filename}.jpg`,
            showLineSize: true,
            converterApiUrl: process.env.REACT_APP_ANNOTATOR_GEO_CONVERTER_API_URL || '',
          }}
          zoom={newzoomLevelAsNumber}
        />
      )}
      {Object.keys(layer).length > 0 && (
        <Box sx={{ textAlign: 'center', p: 1, border: '1px solid #ebebeb' }}>
          <Typography variant='body2' style={{ fontWeight: 'bold' }}>
            Source de l'image: {layer.name}, {layer.precisionLevelInCm}cm, {layer.year}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AnnotatorComponent;
