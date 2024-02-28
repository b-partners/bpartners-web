import { Box, Typography } from '@mui/material';
import { SelectInput, TextInput } from 'react-admin';
import { BpNumberField } from 'src/common/components';

const AnnotatorForm = ({ index }) => {
  const surface = 146;
  const Coating = [
    { id: 'tuiles', name: 'Tuiles' },
    { id: 'ardoise', name: 'Ardoise' },
    { id: 'beton', name: 'Beton' },
  ];
  const Slope = [
    { id: 'flat', name: 'Plat (proche de 0 degrés)' },
    { id: 'low', name: 'Faible (1 à 5 degrés)' },
    { id: 'moderate', name: 'Modéré (5 à 15 degrés)' },
    { id: 'steep', name: 'Raide (15 à 30 degrés)' },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box>
          Surface :
          <Typography component='span' fontWeight={'bold'}>
            {surface} m2
          </Typography>
        </Box>
        <SelectInput name={`${index}.revetement`} source={'revêtement'} choices={Coating} alwaysOn resettable />
        <SelectInput name={`${index}.pente`} source={'pente'} choices={Slope} alwaysOn resettable />
        <TextInput name={`${index}.usury`} source={'usury'} label={'Usure'} />
        <BpNumberField style={{ width: '10%' }} name={`${index}.velux`} label={'Velux'} />
        <TextInput name={`${index}.veluxform`} source={'veluxform'} label={'Velux forme'} />
        <TextInput name={`${index}.obstacle`} source={'obstacle'} label={'Obstacle'} />
        <TextInput name={`${index}.comment`} source='comment' label='Commentaire' multiline />
      </div>
    </Box>
  );
};

export default AnnotatorForm;
