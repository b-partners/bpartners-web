import {
    Dialog,
    DialogContent,
    DialogTitle,
    Typography,
} from '@mui/material';
import ProspectDialogActions from './ProspectDialogActions';
import {DialogType, useProspectContext} from "../../../common/store/Prospect-store";
import {FC} from "react";
import {Prospect} from "bpartners-react-client";

type ProspectDialogProps = {
    type: DialogType;
    prospect: Prospect;
    saveOrUpdateProspectSubmit?: any;
};

export const ProspectDialog: FC<ProspectDialogProps> = ({ type, children, prospect:{name, status}, saveOrUpdateProspectSubmit }) => {
    const {
        closeModal,
        modal: {isOpen, type: modalType},
    } = useProspectContext();

    return (
        modalType === type && (<Dialog open={isOpen} onClose={closeModal}>
            <DialogTitle>
                <Typography>Prospect : {name}</Typography>
            </DialogTitle>
            <DialogContent>
                {children}
            </DialogContent>
            <ProspectDialogActions
                prospectStatus={status}
                saveOrUpdateProspectSubmit={saveOrUpdateProspectSubmit}
            />
        </Dialog>)
    );
};
