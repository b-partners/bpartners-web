import { BP_COLOR } from '@/bp-theme';
import { BPButton, FlexBox } from '@/common/components';
import { useToggle } from '@/common/hooks';
import { handleSubmit } from '@/common/utils';
import { Box, BoxProps, Divider, Typography, useMediaQuery } from '@mui/material';
import { BaseSyntheticEvent, FC } from 'react';
import { ProspectDialog } from '../prospects/components';
import { ProspectDialogProvider } from '../prospects/ProspectsList';

type GetResponsiveValueType = <T extends string | number>(sm: T, lg: T, xl?: T) => T;
const HomeAnnotationInfo: FC<{
  label: string;
  value: string;
  getResponsiveValue: GetResponsiveValueType;
}> = ({ label, value, getResponsiveValue }) => {
  const isCustomizedSmall = useMediaQuery('(max-width:1300px)');

  return (
    <Box
      sx={{
        px: 2,
        py: getResponsiveValue(1, 1.2, 2.5),
        my: getResponsiveValue(1, 1.5, 3),
        width: isCustomizedSmall ? '220px' : getResponsiveValue('250px', '350px', '400px'),
        fontSize: isCustomizedSmall ? '.6rem' : getResponsiveValue('.7rem', '1rem', '1.2rem'),
        bgcolor: BP_COLOR['solid_grey'],
      }}
    >
      <Typography sx={{ fontWeight: 'bold', fontSize: 'inherit' }}>{label}</Typography>
      <Typography sx={{ fontSize: 'inherit' }}>{value}</Typography>
    </Box>
  );
};

const ShadowedBoxImage: FC<BoxProps & { size: string | number; bgurl: string }> = ({ bgurl, sx = {}, size, children, ...boxProps }) => {
  return (
    <Box sx={{ width: size, height: size, backgroundImage: `url(${bgurl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <Box sx={{ bgcolor: 'rgba(0,0,0,.2)', width: '100%', height: '100%', ...sx }} {...boxProps}>
        {children}
      </Box>
    </Box>
  );
};

export const Home = () => {
  const isCustomizedLarge = useMediaQuery('(min-width:1800px)');
  const isCustomizedExtraLarge = useMediaQuery('(min-width:2500px)');
  const isCustomizedSmall = useMediaQuery('(max-width:1300px)');

  const getResponsiveValue: GetResponsiveValueType = (sm, lg, xl) => {
    if (isCustomizedExtraLarge) {
      return xl ?? lg;
    }
    if (isCustomizedLarge) {
      return lg;
    }
    return sm;
  };

  return (
    <main>
      <Typography
        sx={{
          mx: 'auto',
          fontWeight: 'bold',
          textAlign: 'center',
          mb: getResponsiveValue(1, 2, 3),
          mt: getResponsiveValue(1, 2, 8),
          fontSize: getResponsiveValue('1.4rem', '2rem', '2.8rem'),
          maxWidth: getResponsiveValue('700px', '1000px', '1500px'),
        }}
      >
        Pour demarrer ajoutez une adresse et commencez à <span style={{ color: BP_COLOR['20'] }}>analyser les toitures de vos clients et prospects</span>
      </Typography>
      <FlexBox sx={{ gap: getResponsiveValue(3, 5, 6), alignItems: 'start' }}>
        <Box>
          <FlexBox>
            <Box sx={{ transform: getResponsiveValue('translateX(30px)', 'translateX(50px)') }}>
              <ShadowedBoxImage bgurl='/home/1.png' size={getResponsiveValue('150px', '220px', '350px')} />
              <ShadowedBoxImage bgurl='/home/2.png' size={getResponsiveValue('150px', '220px', '350px')} />
            </Box>
            <ShadowedBoxImage
              bgurl='/home/3.png'
              size={isCustomizedSmall ? '350px' : getResponsiveValue('400px', '500px', '800px')}
              sx={{
                p: 1,
                display: 'flex',
                justifyContent: 'end',
                flexDirection: 'column',
              }}
            >
              <Typography sx={{ fontSize: getResponsiveValue('.8rem', '1rem', '1.2rem'), fontWeight: 'bold', textAlign: 'end', color: 'white' }}>
                Source: Image HD 5cm - Mars 2024
              </Typography>
              <Typography
                sx={{
                  ml: 'auto',
                  color: 'white',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  bgcolor: BP_COLOR['10'],
                  px: getResponsiveValue(4, 6),
                  py: getResponsiveValue('7px', '10px'),
                  fontSize: getResponsiveValue('.8rem', '1rem', '1.2rem'),
                }}
              >
                NOTE DÉGRADATION GLOBALE: 41%
              </Typography>
            </ShadowedBoxImage>
          </FlexBox>
        </Box>
        <Box>
          <Typography color='gray' sx={{ pl: 1, fontWeight: 'bold', fontSize: getResponsiveValue('.8rem', '1.2rem', '1.5rem') }}>
            ANALYSE DE TOITURE
          </Typography>
          <Divider sx={{ height: '2px', mb: 1 }} />
          <FlexBox sx={{ gap: { sm: 1, xl: 4 }, alignItems: 'end' }}>
            <Box>
              <HomeAnnotationInfo getResponsiveValue={getResponsiveValue} label='SURFACE TOTALE' value='3 205m²' />
              <HomeAnnotationInfo getResponsiveValue={getResponsiveValue} label='TYPE' value='PLAT' />
              <HomeAnnotationInfo getResponsiveValue={getResponsiveValue} label='PENTE' value='0°' />
              <HomeAnnotationInfo getResponsiveValue={getResponsiveValue} label="TAUX D'HUMIDITE" value='26%' />
              <HomeAnnotationInfo getResponsiveValue={getResponsiveValue} label='FISSURE CASSURE' value='NÉANT' />
              <HomeAnnotationInfo getResponsiveValue={getResponsiveValue} label='RÊVETEMENT' value='ASPHALTE GRAY' />
            </Box>
            <Box>
              <HomeAnnotationInfo getResponsiveValue={getResponsiveValue} label='MUTATION HUM' value='DÉGRADATION' />
              <HomeAnnotationInfo getResponsiveValue={getResponsiveValue} label='TAUX DE RÉPARATION' value='0%' />
              <HomeAnnotationInfo getResponsiveValue={getResponsiveValue} label="TAUX D'USURE / MOISISSURE" value='47%' />
              <HomeAnnotationInfo getResponsiveValue={getResponsiveValue} label='RISQUE FEU' value='NÉANT' />
              <HomeAnnotationInfo getResponsiveValue={getResponsiveValue} label='OBSTACLE' value='7%' />
              <HomeAnnotationInfo getResponsiveValue={getResponsiveValue} label='HÉTÉROGÉNÉITÉ DES REVÊTEMENTS' value='74%' />
            </Box>
          </FlexBox>
        </Box>
      </FlexBox>
      <ProspectDialogProvider
        ComponentChild={({ saveOrUpdateProspectSubmit }: Pick<CreateProspectDialogProps, 'saveOrUpdateProspectSubmit'>) => (
          <CreateProspectDialog saveOrUpdateProspectSubmit={saveOrUpdateProspectSubmit} getResponsiveValue={getResponsiveValue} />
        )}
      />
    </main>
  );
};

type CreateProspectDialogProps = {
  saveOrUpdateProspectSubmit: (toggleDialog: () => void, isCreating: boolean, e: BaseSyntheticEvent) => Promise<void>;
  getResponsiveValue: GetResponsiveValueType;
};
const CreateProspectDialog: FC<CreateProspectDialogProps> = ({ saveOrUpdateProspectSubmit, getResponsiveValue }) => {
  const { value: isCreating, toggleValue: toggleCreating } = useToggle();

  const saveOrUpdateProspect = (event: BaseSyntheticEvent) => saveOrUpdateProspectSubmit(toggleCreating, isCreating, event);

  return (
    <>
      <BPButton
        size='large'
        onClick={toggleCreating}
        data-testid='create-prospect-button'
        label='resources.prospects.new'
        sx={{
          mx: 'auto',
          display: 'block',
          fontWeight: 'bold',
          px: getResponsiveValue(2, 3),
          py: getResponsiveValue(1.4, 2),
          mt: getResponsiveValue(3, 4),
          fontSize: getResponsiveValue('.9rem', '1.5rem', '2rem'),
          width: 'fit-content !important',
        }}
      />
      {isCreating && (
        <form onSubmit={handleSubmit(saveOrUpdateProspect)} style={{ display: 'flex', flexDirection: 'column' }}>
          <ProspectDialog open={isCreating} close={toggleCreating} saveOrUpdateProspectSubmit={saveOrUpdateProspect} isCreating={isCreating} />
        </form>
      )}
    </>
  );
};
