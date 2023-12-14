import { Button, Typography, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import { TRANSPARENT_BUTTON_STYLE } from 'src/security/style';

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
          <>
            <Typography style={{ color: '#0009', fontSize: '14px', paddingBottom: '20px' }}>
              En continuant, vous acceptez que BPartners transmette anonymement vos informations à&nbsp;
              <Button
                sx={{ ...TRANSPARENT_BUTTON_STYLE }}
                onClick={() => {
                  window.open('https://adresse.data.gouv.fr/base-adresse-nationale#4.4/46.9/1.7', '_blank', 'noopener');
                }}
              >
                <Typography style={{ fontSize: '13px', textDecoration: 'underline', paddingBottom: '2px' }}> la Base Adresse Nationale</Typography>
              </Button>{' '}
              afin de générer des nouveaux prospects.
              <br />
              Pour plus d'infos, consultez&nbsp;
              <Button
                sx={{ ...TRANSPARENT_BUTTON_STYLE }}
                onClick={() => {
                  window.open('https://legal.bpartners.app/', '_blank', 'noopener');
                }}
              >
                <Typography style={{ fontSize: '13px', textDecoration: 'underline', paddingBottom: '2px' }}> https://legal.bpartners.app/</Typography>
              </Button>
            </Typography>
          </>
        }
        checked={checked}
      />
    </FormGroup>
  );
};

export default CalendarCheckboxCGS;
