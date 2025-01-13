import { Box, SxProps, Typography } from '@mui/material';
import { FC, PropsWithChildren, useMemo } from 'react';
import { useRedirect } from 'react-admin';
import { v4 as uuid } from 'uuid';

import { BPButton, FlexBox } from '@/common/components';
import { useWindowResize } from '@/common/hooks';
import { useWrappedSearchParams } from '@/common/utils';
import { splitArrayIntoGroups } from '@/common/utils/split-array-into-groups';
import { stringifyObj } from '@/common/utils/stringify';
import { wearTranslation } from '@/constants';
import { AnnotationInfo } from '@/operations/annotator';
import { getCached } from '@/providers';
import { Polygon } from '@bpartners/annotator-component';
import { AnnotatorComponent } from '../AnnotatorComponent';
import './export.css';

const PDF_TITLE_SX: SxProps = {
  opacity: 0.9,
  fontWeight: 'bold',
  fontFamily: 'Times New Roman',
};

type PageProps = PropsWithChildren<{
  sx?: SxProps;
}>;
const Page: FC<PageProps> = ({ children, sx = {} }) => (
  <Box
    className='pdf-page'
    sx={{
      p: 2,
      my: 1,
      mx: 'auto',
      width: '100%',
      bgcolor: 'white',
      maxWidth: '780px',
      position: 'relative',
      height: '100vh',
      minHeight: '1000px',
      maxHeight: '1000px',
      borderRadius: '8px',
      pageBreakAfter: 'always',
      boxShadow: '0 0 2px #00000040',
      ...sx,
    }}
  >
    <FlexBox
      className='pdf-header'
      sx={{ alignItems: 'end', width: '100%', p: 2, justifyContent: 'space-between', position: 'absolute', top: '0px', left: '0px' }}
    >
      <img className='bp-logo' src={'/bp-logo-full.webp'} alt='bp-logo' style={{ width: '150px' }} />
    </FlexBox>
    <Box sx={{ mt: 10, px: 4, width: '100%' }}>{children}</Box>
  </Box>
);

type Annotation = {
  polygon: Polygon;
  info: AnnotationInfo;
};
export const ExportAnalyse = () => {
  const redirect = useRedirect();
  const { imgUrl, useDrafts, zoomLevel, pictureId, address } = useWrappedSearchParams(['address', 'imgUrl', 'useDrafts', 'zoomLevel', 'pictureId']);
  const { height } = useWindowResize();
  const polygons = getCached.polygons();
  const annotationInfos = getCached.annotationsInfoList();

  const goToAnnotator = () => {
    redirect(`/annotator?address=${address}&imgUrl=${encodeURIComponent(imgUrl)}&zoomLevel=${zoomLevel}&pictureId=${pictureId}&useDrafts=${useDrafts}`);
  };

  const annotations: Annotation[] = polygons.map(polygon => ({
    info: annotationInfos.find(annotationInfo => annotationInfo.polygonId === polygon.id),
    polygon: polygon,
  }));
  const annotationInfosPages = splitArrayIntoGroups(annotations, 3 /* can show only 3 annotations informations per page*/);

  return (
    <Box sx={{ mx: 'auto' }} className='export-on'>
      <Typography className='hide-on-print' sx={{ fontWeight: 'bold', my: 1, textAlign: 'center', opacity: 0.9, fontSize: '1.2rem' }}>
        Exporter l'analyse sous format PDF
      </Typography>
      <FlexBox className='hide-on-print' sx={{ gap: 1 }}>
        <BPButton onClick={() => window.print()} label='resources.draftsAnnotations.export' />
        <BPButton data-testid='go-back-to-annotator-btn' onClick={goToAnnotator} label="Retourner vers l'annotations" />
      </FlexBox>
      <Page key={uuid()} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fledDirection: 'column' }}>
        <Typography data-testid='export-pdf-title' variant='h1' sx={{ textAlign: 'center', fontSize: '1rem', ...PDF_TITLE_SX }}>
          Rapport d'Analyse de l'adresse : {address}
        </Typography>
        <AnnotatorComponent
          width={700}
          height={height * 0.7}
          polygons={polygons}
          allowSelect={false}
          showFileSource={false}
          allowAnnotation={false}
          buttonComponent={() => null}
          boxWrapperSx={{ height: 'fit-content', bgcolor: 'transparent !important' }}
        />
      </Page>
      {annotationInfosPages.map(annotations => (
        <Page key={uuid()}>
          <Typography sx={{ ...PDF_TITLE_SX, mb: 2 }}>Informations des annotations</Typography>
          <FlexBox sx={{ flexDirection: 'column', alignItems: 'start', gap: 2 }}>
            {annotations.map(annotation => (
              <ExportAnnotationInfoItem key={annotation.polygon.id} annotation={annotation} />
            ))}
          </FlexBox>
        </Page>
      ))}
    </Box>
  );
};

const ExportAnnotationInfoItem: FC<{ annotation: Annotation }> = ({ annotation }) => {
  const { surface } = annotation.polygon;

  const { wear, slope, labelType, covering, wearLevel, moldRate, obstacle, labelName, comment, humidityLevel } = annotation.info;

  const infos = useMemo(() => {
    return [
      { label: 'Type', value: labelType },
      { label: 'Surface', value: surface, unity: 'm²' },
      { label: 'Revêtement', value: covering },
      { label: 'Pente', value: slope, unity: '/12' },
      { label: 'Usure', value: wearTranslation[wear] },
      { label: "Taux d'usure", value: wearLevel },
      { label: 'Taux de moisissure', value: moldRate },
      { label: "Taux d'humidité", value: humidityLevel },
      { label: 'Obstacle', value: obstacle },
      { label: 'Commentaire', value: comment },
    ];
  }, [stringifyObj(annotation)]);

  return (
    <Box>
      <FlexBox sx={{ justifyContent: 'start', gap: 1 }}>
        <Typography variant='h3' fontSize={'17px'} sx={{ ...PDF_TITLE_SX, mb: 1 }}>
          {labelName}
        </Typography>
        <Typography style={{ width: '10px', transform: 'translateY(-3px)', height: '0px', border: `6px solid ${annotation.polygon.strokeColor}` }} />
      </FlexBox>
      {infos.map(({ label, value, unity }) => (
        <AnnotationInfoDetails key={label} label={label} unity={unity} value={value} />
      ))}
    </Box>
  );
};

const AnnotationInfoDetails: FC<{ label: string; unity: string; value: string | number }> = ({ label, unity = '', value }) => {
  return (
    <Box>
      <Typography sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
        <Typography component='span' fontWeight='bold' sx={{ fontSize: '14px' }}>
          {label}:{' '}
        </Typography>
        <Typography component='span'>{value ? value + ' ' + unity : 'Non renseigné'}</Typography>
      </Typography>
    </Box>
  );
};
