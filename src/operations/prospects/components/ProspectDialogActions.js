import { Button, DialogActions, CircularProgress } from '@mui/material';
import { useProspectContext } from 'src/common/store/Prospect-store';

const ProspectDialogActions = ({ prospectStatus, close, prospectFeedback, saveOrUpdateProspectSubmit }) => {
  const { loading, selectedStatus } = useProspectContext();
  const shouldRenderButton = text => {
    return (
      <Button onClick={saveOrUpdateProspectSubmit} disabled={loading} startIcon={loading && <CircularProgress color='inherit' size={18} />}>
        {text}
      </Button>
    );
  };

  const renderCancelButton = () => {
    return <Button onClick={close}>Annuler</Button>;
  };

  return (
    <DialogActions>
      {prospectStatus === 'TO_CONTACT' ? (
        <>
          {renderCancelButton()}
          {prospectFeedback && prospectFeedback === 'NOT_INTERESTED'
            ? shouldRenderButton('Abandonner ce prospect')
            : selectedStatus === 'CONTACTED'
            ? shouldRenderButton('Réserver ce Prospect')
            : selectedStatus === 'CONVERTED'
            ? shouldRenderButton('Transformer ce prospect en client')
            : shouldRenderButton('Valider')}
        </>
      ) : prospectStatus === 'CONTACTED' ? (
        <>
          {renderCancelButton()}
          {prospectFeedback && prospectFeedback === 'PROPOSAL_DECLINED'
            ? shouldRenderButton('Abandonner ce prospect')
            : selectedStatus === 'TO_CONTACT'
            ? shouldRenderButton('Libérer ce prospect')
            : selectedStatus === 'CONVERTED'
            ? shouldRenderButton('Transformer ce prospect en client')
            : shouldRenderButton('Valider')}
        </>
      ) : prospectStatus === 'CONVERTED' ? (
        <>
          {renderCancelButton()}
          {prospectFeedback && prospectFeedback === 'PROPOSAL_DECLINED'
            ? shouldRenderButton('Abandonner ce prospect')
            : selectedStatus === 'TO_CONTACT'
            ? shouldRenderButton('Libérer ce client')
            : selectedStatus === 'CONTACTED'
            ? shouldRenderButton('Remettre ce client en prospect')
            : shouldRenderButton('Valider')}
        </>
      ) : (
        <>
          {renderCancelButton()}
          <Button onClick={saveOrUpdateProspectSubmit}>Valider</Button>
        </>
      )}
    </DialogActions>
  );
};

export default ProspectDialogActions;
