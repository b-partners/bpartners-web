import { Typography } from '@mui/material';
import { FC, useMemo } from 'react';
import { wearTranslation } from 'src/constants';
import { AnnotationInfoDetailsProps, AnnotationInfoProps } from '../types';

const AnnotationInfoDetails: FC<AnnotationInfoDetailsProps> = ({ label, unity = '', value }) => {
  return (
    <Typography variant='body2'>
      <span>{label}: </span>
      <Typography component='span' fontWeight={'bold'}>
        {value ? value + ' ' + unity : 'Non renseigné'}
      </Typography>
    </Typography>
  );
};

export const AnnotationInfo: FC<AnnotationInfoProps> = ({ areaPictureAnnotationInstance }) => {
  const { labelName } = areaPictureAnnotationInstance;
  const infos = useMemo(() => {
    const { metadata, labelType } = areaPictureAnnotationInstance;
    const { area, comment, covering, wearLevel, slope, wearness, moldRate, obstacle } = metadata || {};
    return [
      { label: 'Type', value: labelType },
      { label: 'Surface', value: area, unity: 'm²' },
      { label: 'Revêtement', value: covering },
      { label: 'Pente', value: slope, unity: '/12' },
      { label: 'Usure', value: wearTranslation[wearness] },
      { label: "Taux d'usure", value: wearLevel },
      { label: 'Taux de moisissure', value: moldRate },
      { label: 'Obstacle', value: obstacle },
      { label: 'Commentaire', value: comment },
    ];
  }, [areaPictureAnnotationInstance]);

  return (
    <>
      <Typography component='span' fontWeight={'bold'} fontSize={'18px'}>
        {labelName}
      </Typography>
      {infos.map(({ label, value, unity }) => (
        <AnnotationInfoDetails key={label} label={label} unity={unity} value={value} />
      ))}
    </>
  );
};
