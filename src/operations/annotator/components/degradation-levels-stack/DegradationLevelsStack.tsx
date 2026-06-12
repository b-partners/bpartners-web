import { BlockOutlined, BuildOutlined, GppGoodOutlined, TrendingUpOutlined, WarningAmberOutlined } from '@mui/icons-material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { FC } from 'react';
import { DegradationLevelsStackStyle } from './style';

interface DegradationLevelsStackProps {
  globalRate: { value: number; type: string };
}

const roofStateLevels = [
  {
    label: 'A',
    icon: GppGoodOutlined,
    title: 'Toiture en bon état',
    description: 'Aucune intervention visible nécessaire',
    main: '#43A047',
    soft: '#E7F6EA',
    bar: '#4CB050',
  },
  {
    label: 'B',
    icon: BlockOutlined,
    title: 'Entretien préventif',
    description: 'Pour garder la toiture en bonne santé',
    main: '#7CB342',
    soft: '#F1F8E2',
    bar: '#9CCC5A',
  },
  {
    label: 'C',
    icon: BuildOutlined,
    title: 'Intervention nécessaire',
    description: 'Pour ralentir le vieillissement',
    main: '#EFA31D',
    soft: '#FDF3D8',
    bar: '#F4C23B',
  },
  {
    label: 'D',
    icon: TrendingUpOutlined,
    title: 'Réparation prioritaire',
    description: 'Dégradation visible, risque à traiter',
    main: '#F37A2B',
    soft: '#FDEEE1',
    bar: '#F58A3F',
  },
  {
    label: 'E',
    icon: WarningAmberOutlined,
    title: 'Risque critique',
    description: 'Intervention urgente à prévoir',
    main: '#EC3A3A',
    soft: '#FDE8E8',
    bar: '#EF4444',
  },
];

export const DegradationLevelsStack: FC<DegradationLevelsStackProps> = ({ globalRate, ...rest }) => {
  const activeLevel = roofStateLevels.find(({ label }) => label === globalRate.type) ?? roofStateLevels[0];
  const ActiveIcon = activeLevel.icon;

  return (
    <Box className='degradation-fieldset' sx={DegradationLevelsStackStyle} {...rest}>
      <Box className='degradation-stack'>
        <Box className='degradation-popup'>
          <Box className='roof-state-card'>
            <Box className='roof-state-inner'>
              <Typography className='roof-state-title'>État apparent de la toiture</Typography>
              <Divider className='roof-state-top-divider' />
              <Stack className='roof-state-columns' direction='row'>
                {roofStateLevels.map(({ label, icon, title, description, main, soft }) => {
                  const Icon = icon;
                  return (
                    <Box
                      key={label}
                      className={`roof-state-col${label === activeLevel.label ? ' roof-state-col-active' : ''}`}
                      sx={label === activeLevel.label ? { borderColor: main } : undefined}
                    >
                      <Box className='roof-state-col-icon' sx={{ bgcolor: soft, color: main }}>
                        <Icon className='roof-state-col-icon-svg' />
                      </Box>
                      <Typography className='roof-state-col-title'>{title}</Typography>
                      <Typography className='roof-state-col-desc'>{description}</Typography>
                    </Box>
                  );
                })}
              </Stack>
              <Stack className='roof-state-bar' direction='row'>
                {roofStateLevels.map(({ label, bar }) => (
                  <Box key={label} className='roof-state-bar-seg' sx={{ bgcolor: bar }} />
                ))}
              </Stack>
              <Stack className='roof-state-markers' direction='row'>
                {roofStateLevels.map(({ label }) => (
                  <Box key={label} className='roof-state-marker'>
                    {label === activeLevel.label ? <ArrowDropUpIcon className='roof-state-pointer' /> : <Box className='roof-state-dot' />}
                  </Box>
                ))}
              </Stack>
              <Stack className='roof-state-footer' direction='row'>
                <Stack className='roof-state-detected' direction='row' alignItems='center' gap={1.5}>
                  <Box className='roof-state-footer-icon' sx={{ bgcolor: activeLevel.soft, color: activeLevel.main }}>
                    <ActiveIcon className='roof-state-footer-icon-svg' />
                  </Box>
                  <Box>
                    <Typography className='roof-state-footer-label'>Niveau détecté</Typography>
                    <Typography className='roof-state-detected-value' sx={{ color: activeLevel.main }}>
                      {activeLevel.description}
                    </Typography>
                  </Box>
                </Stack>
                <Divider className='roof-state-footer-divider' orientation='vertical' flexItem />
                <Box className='roof-state-score'>
                  <Typography className='roof-state-footer-label'>Score d'usure visible</Typography>
                  <Typography className='roof-state-score-value' sx={{ color: activeLevel.main }}>
                    {globalRate.value}%
                  </Typography>
                </Box>
              </Stack>
              <Typography className='roof-state-disclaimer'>Analyse issue d'images aériennes. Ne remplace pas une expertise terrain.</Typography>
            </Box>
          </Box>
        </Box>
        <Box className='degradation-pill-active' sx={{ bgcolor: activeLevel.main, color: '#fff' }}>
          <Box className='degradation-pill-icon'>
            <ActiveIcon className='degradation-pill-icon-svg' />
          </Box>
          <Box className='degradation-pill-texts'>
            <Typography className='degradation-pill-name'>{activeLevel.title}</Typography>
            <Typography className='degradation-pill-desc'>{activeLevel.description}</Typography>
          </Box>
          <Typography className='degradation-pill-value'>{globalRate.value}%</Typography>
        </Box>
      </Box>
    </Box>
  );
};
