import {DialogActions } from '@mui/material';
import { useProspectContext } from 'src/common/store/prospect-store';
import {useWatch} from 'react-hook-form';
import {BPButton} from "../../../common/components/BPButton";

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
    const {prospectStatus, close, saveOrUpdateProspectSubmit, isEditing} = props;
    const {loading, selectedStatus} = useProspectContext();
    const {prospectFeedback} = useWatch();

    const primaryButtonText = getPrimaryButtonText(prospectStatus, prospectFeedback, selectedStatus, isEditing);

    return (
        <DialogActions sx={{paddingInline: '1.5rem'}}>
            <BPButton label='Annuler' onClick={close} sx={{width: '80px !important'}}/>
            <BPButton onClick={saveOrUpdateProspectSubmit} isLoading={loading} label={primaryButtonText} />
        </DialogActions>
    );
};

export default ProspectDialogActions;
