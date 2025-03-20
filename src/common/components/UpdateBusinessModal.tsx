import BusinessActivitiesInputs from '@/operations/account/BusinessActivityForm';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useDialog } from '../store/dialog';
import { NOOP_FN } from '../utils/noop_fn';

export const UpdateBusinessModal = () => {
  const { isOpen, close } = useDialog();
  return (
    <Dialog open={isOpen} onClose={NOOP_FN}>
      <DialogTitle>Veuillez renseigner votre activité</DialogTitle>
      <DialogContent>
        <BusinessActivitiesInputs
          onSuccess={close}
          containerStyle={{ width: '100%' }}
          autocompleteStyle={{
            width: '100%',
            marginY: 2,
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
