import { Box, Typography } from '@mui/material';
import { SelectInput, TextInput } from 'react-admin';
import { BpNumberField } from 'src/common/components';
import SlopeSelect from './SlopeSelect';

const AnnotatorForm = ({ index, surface }) => {
  const Coating = [
    { id: 'tuiles', name: 'Tuiles' },
    { id: 'ardoise', name: 'Ardoise' },
    { id: 'beton', name: 'Beton' },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box>
          Surface :
          <Typography component='span' fontWeight={'bold'}> {surface} m²</Typography>
        </Box>
        <SelectInput name={`${index}.covering`} source={'covering'} label={'Revêtement'} choices={Coating} alwaysOn resettable />
        <SlopeSelect name={`${index}.slope`} />
        {/* <TextInput name={`${index}.wearLevel`} source={'wearLevel'} label={'Usure'} /> */}
        <BpNumberField name={`${index}.wearLevel`} source={'wearLevel'} label={'Usure'} /> {/* ! envoyé la donnée en NUMBER */}
        <BpNumberField style={{ width: '10%' }} name={`${index}.velux`} source={'velux'} label={'Velux'} />
        <TextInput name={`${index}.veluxform`} source={'veluxform'} label={'Velux forme'} />
        <TextInput name={`${index}.obstacle`} source={'obstacle'} label={'Obstacle'} />
        <TextInput name={`${index}.comment`} source='comment' label='Commentaire' multiline />
      </div>
    </Box>
  );
};

export default AnnotatorForm;
