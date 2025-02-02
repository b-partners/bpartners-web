import { Typography } from '@mui/material';
import { AreaPictureAnnotationInstance } from '@bpartners/typescript-client';
import { AnnotationCoveringType, AnnotationLabelsType } from '@/constants';
import { FC, useMemo } from 'react';
import { translateAnnotationInfo } from '../utils/annotation-info-translator';

export type AnnotationInfoProps = {
  areaPictureAnnotationInstance: AreaPictureAnnotationInstance;
};

export const AnnotationInfo: FC<AnnotationInfoProps> = ({ areaPictureAnnotationInstance }) => {
  const { labelName } = areaPictureAnnotationInstance;
  const infos = useMemo(() => {
    const { metadata, labelType } = areaPictureAnnotationInstance;
    const { area, comment, covering, wearLevel, slope, wearness, moldRate, obstacle, humidityLevel } = metadata || {};
    return translateAnnotationInfo({
      labelType: labelType as keyof AnnotationLabelsType,
      area,
      covering: covering as keyof AnnotationCoveringType,
      slope,
      wear: wearness,
      wearLevel,
      moldRate,
      humidityLevel,
      obstacle,
      comment,
    });
  }, [areaPictureAnnotationInstance]);

  return (
    <>
      <Typography component='span' fontWeight={'bold'} fontSize={'18px'}>
        {labelName}
      </Typography>
      {infos.map(({ label, value }) => (
        <Typography variant='body2'>
          <span style={{ fontWeight: 'bold' }}>{label}: </span>
          <Typography component='span' fontWeight={'normal'}>
            {value}
          </Typography>
        </Typography>
      ))}
    </>
  );
};
