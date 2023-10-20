import { Button, DialogActions, CircularProgress } from '@mui/material';
import { useProspectContext } from 'src/common/store/prospect-store';
import { useWatch } from 'react-hook-form';

const getPrimaryButtonText = (prospectStatus, prospectFeedback, selectedStatus, isEditing) => {
  if (isEditing) {
    return 'Modifier le prospect';
  }

  const statuses = {
    TO_CONTACT: {
      NOT_INTERESTED: 'Abandonner ce prospect',
      CONTACTED: 'Réserver ce prospect',
      CONVERTED: 'Transformer ce prospect en client',
    },
    CONTACTED: {
      PROPOSAL_DECLINED: 'Abandonner ce prospect',
      TO_CONTACT: 'Libérer ce prospect',
      CONVERTED: 'Transformer ce prospect en client',
    },
    CONVERTED: {
      PROPOSAL_DECLINED: 'Abandonner ce prospect',
      TO_CONTACT: 'Libérer ce client',
      CONTACTED: 'Remettre ce client en prospect',
    },
  };

  const defaultText = 'Valider';

  if (statuses[prospectStatus]) {
    const statusObj = statuses[prospectStatus];
    if (statusObj[prospectFeedback]) {
      return statusObj[prospectFeedback];
    } else if (statusObj[selectedStatus]) {
      return statusObj[selectedStatus];
    }
  }

  return defaultText;
};

const ProspectDialogActions = props => {
  const { prospectStatus, close, saveOrUpdateProspectSubmit, isEditing } = props;
  const { loading, selectedStatus } = useProspectContext();
  const { prospectFeedback } = useWatch();

  const renderCancelButton = () => <Button onClick={close}>Annuler</Button>;

  const primaryButtonText = getPrimaryButtonText(prospectStatus, prospectFeedback, selectedStatus, isEditing);

  return (
    <DialogActions>
      {renderCancelButton()}
      <Button onClick={saveOrUpdateProspectSubmit} disabled={loading} startIcon={loading && <CircularProgress color='inherit' size={18} />}>
        {primaryButtonText}
      </Button>
    </DialogActions>
  );
};

export default ProspectDialogActions;
