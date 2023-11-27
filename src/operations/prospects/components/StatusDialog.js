import { Dialog, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import { handleSubmit } from '../../../common/utils';
import PropTypes from 'prop-types';

const StatusDialog = ({ open, toggleStatusDialog, prospect, changeStatus }) => {
  return (
    <Dialog open={open} onClose={toggleStatusDialog}>
      <DialogTitle>
        <Typography sx={{ paddingBottom: '5px' }}>Changez le statut du prospect pour le protéger</Typography>
        <Divider />
      </DialogTitle>
      <DialogContent>
        <FormControl>
          <RadioGroup defaultValue={prospect.status} name='status' onChange={handleSubmit(changeStatus)}>
            <FormControlLabel value='TO_CONTACT' control={<Radio size='small' />} label='À contacter' />
            <FormControlLabel value='CONTACTED' control={<Radio size='small' />} label='Contacté' />
            <FormControlLabel value='CONVERTED' control={<Radio size='small' />} label='Converti' />
          </RadioGroup>
        </FormControl>
      </DialogContent>
    </Dialog>
  );
};

export default StatusDialog;

StatusDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  toggleStatusDialog: PropTypes.func.isRequired,
  prospect: PropTypes.object.isRequired,
  changeStatus: PropTypes.func.isRequired,
};
