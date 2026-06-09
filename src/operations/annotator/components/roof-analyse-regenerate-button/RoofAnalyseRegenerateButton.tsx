import { useRoofAnalyseQuery } from '@/common/fetcher';
import { annotatorStore, getAnnotationScreen, useAnnotatorComponentStore, useAnnotatorScreenSwitch } from '@/common/store';
import { clearPolygons, removeCache } from '@/providers';
import { Refresh, Roofing } from '@mui/icons-material';
import { Button, ButtonProps, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip } from '@mui/material';
import { FC, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { isAfterAnalyse, shiftPolygons } from '../../utils';
import { RoofAnalyseRegenerateButtonStyle } from './style';

export const RoofAnalyseRegenerateButton: FC<ButtonProps> = props => {
  const { screen } = useAnnotatorScreenSwitch();
  const [open, setOpen] = useState(false);
  const {
    areaPictureDetails,
    analyseImageUrl,
    analyseLoadingPolygon,
    setAnalyseInformation,
    setAnalyseImageUrl,
    setAnalyseImageFileId,
    setAnalyseLoadingPolygon,
  } = useAnnotatorComponentStore();
  const clearScreenAnnotations = annotatorStore.useAnnotatorStore(params => params.clearScreenAnnotations);
  const roof2dPolygon = annotatorStore.useAnnotatorStore(
    useShallow(
      ({ annotations }) => Object.values(annotations).find(a => getAnnotationScreen(a) === 'annotator' && a.annotationInfos?.labelType === 'roof')?.polygon
    )
  );
  const { polygonList: analysePolygonList } = annotatorStore.useAnalysePolygonStore();
  const analyseInfos = annotatorStore.useAnalyseAnnotatorInfoStore();

  const analyseRoofInfos = analyseInfos.filter(info => info?.labelType === 'roof');
  const analyseRoofPolygon = analyseRoofInfos.length === 1 ? analysePolygonList.find(polygon => polygon.id === analyseRoofInfos[0].polygonId) : undefined;
  const roofForAnalyse = roof2dPolygon ?? analyseRoofPolygon;
  const roofPolygons = roofForAnalyse ? [roofForAnalyse] : [];

  const handleSuccess = () => {
    clearScreenAnnotations('roof-analyse');
    clearPolygons(false);
  };

  const { mutate: processDetection } = useRoofAnalyseQuery(roofPolygons, areaPictureDetails, handleSuccess);

  const isThereARoofPolygon = !!roofForAnalyse;
  const isPrecisionLevelInCmCorrect = areaPictureDetails?.actualLayer?.precisionLevelInCm === 5;
  const isAlreadyAnalysed = !!analyseImageUrl || isAfterAnalyse(analysePolygonList);
  const is2DRoof = !!roof2dPolygon;
  const isAnalysing = !!analyseLoadingPolygon;

  const runDetection = () => {
    const loadingPolygon = shiftPolygons(roofPolygons, areaPictureDetails, true)?.[0]?.points?.slice() ?? [];
    removeCache.roofDelimitation();
    clearScreenAnnotations('roof-analyse');
    setAnalyseInformation({ geoJsonResultUrl: '', imageUrl: '' });
    setAnalyseImageUrl(null);
    setAnalyseImageFileId(null);
    setAnalyseLoadingPolygon(loadingPolygon);
    processDetection();
  };

  const didAutoRun = useRef(false);
  useEffect(() => {
    if (didAutoRun.current) return;
    if (screen !== 'roof-analyse' || !is2DRoof || isAlreadyAnalysed || !isThereARoofPolygon || !isPrecisionLevelInCmCorrect || isAnalysing) return;
    didAutoRun.current = true;
    runDetection();
  }, [screen, is2DRoof, isAlreadyAnalysed, isThereARoofPolygon, isPrecisionLevelInCmCorrect, isAnalysing]);

  if (screen !== 'roof-analyse') return null;

  const handleConfirm = () => {
    runDetection();
    setOpen(false);
  };

  const handleClick = () => (isAlreadyAnalysed ? setOpen(true) : runDetection());

  const button = (
    <Button
      sx={RoofAnalyseRegenerateButtonStyle}
      onClick={handleClick}
      startIcon={isAlreadyAnalysed ? <Refresh fontSize='small' /> : <Roofing fontSize='small' />}
      {...props}
      disabled={!isThereARoofPolygon || !isPrecisionLevelInCmCorrect || isAnalysing}
    >
      {isAlreadyAnalysed ? 'Relancer l’analyse' : 'Lancer l’analyse'}
    </Button>
  );

  return (
    <>
      {isPrecisionLevelInCmCorrect ? (
        button
      ) : (
        <Tooltip title='L’image actuelle n’a pas une précision de 5 cm, donc l’analyse ne peut pas être lancée.'>
          <span>{button}</span>
        </Tooltip>
      )}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Relancer l’analyse de toiture</DialogTitle>
        <DialogContent>
          <DialogContentText>Toutes les informations de l’analyse précédente seront supprimées. Voulez-vous continuer ?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleConfirm} variant='contained' color='error'>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
