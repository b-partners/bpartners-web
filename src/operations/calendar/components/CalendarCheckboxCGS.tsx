import ExternalLinkButton from '@/common/components/BPExternalLinkButton';
import { Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material';

type Props = {
  checked: boolean;
  handleCheck: () => void;
};

const CalendarCheckboxCGS = ({ checked, handleCheck }: Props) => {
  return (
    <FormGroup onChange={handleCheck}>
      <FormControlLabel
        data-testid='control-cgs'
        style={{ alignItems: 'start' }}
        control={<Checkbox />}
        label={
          <Typography style={{ color: '#0009', fontSize: '14px', paddingBottom: '20px' }}>
            En continuant, vous acceptez que BPartners transmette anonymement vos informations à{' '}
            <ExternalLinkButton url='https://adresse.data.gouv.fr/base-adresse-nationale#4.4/46.9/1.7'>
              <Typography style={{ fontSize: '13px', textDecoration: 'underline', paddingBottom: '2px' }}> la Base Adresse Nationale</Typography>
            </ExternalLinkButton>{' '}
            afin de générer des nouveaux prospects.
            <br />
            Pour plus d'infos, consultez{' '}
            <ExternalLinkButton url='https://legal.bpartners.app/'>
              <Typography style={{ fontSize: '13px', textDecoration: 'underline', paddingBottom: '2px' }}> https://legal.bpartners.app/</Typography>
            </ExternalLinkButton>
          </Typography>
        }
        checked={checked}
      />
    </FormGroup>
  );
};

export default CalendarCheckboxCGS;
