import {ProspectDialog} from "./ProspectDialog";
import {BpFormField, BpNumberField} from "../../../common/components";
import {Box, Typography} from "@mui/material";
import {InvoiceSelection} from "./InvoiceSelection";

const UpdateModal = props => {
    const {
        prospect: {status},
        saveOrUpdateProspectSubmit,
    } = props;

    return (
        <ProspectDialog
            type='EDIT'
            saveOrUpdateProspectSubmit={saveOrUpdateProspectSubmit}
        >
            <BpFormField style={{width: '100%'}} name='email' type='email' label='Email'/>
            <BpFormField style={{width: '100%'}} name='phone' label='Téléphone'/>
            <BpFormField style={{width: '100%'}} name='address' label='Adresse'/>
            <BpFormField style={{width: '100%'}} name='name' label='Nom du prospect'/>
            <BpFormField multiline rows={4} style={{width: '100%'}} name='comment' label='Commentaire'/>
            {status === 'TO_CONTACT' ? (
                <InvoiceSelection name='invoice' label='Devis' invoiceTypes={['DRAFT']}/>
            ) : (
                <InvoiceSelection name='invoice' label='Factures' invoiceTypes={['CONFIRMED', 'PAID']}/>
            )}
            <Box sx={{display: 'flex', flexDirection: 'row', marginTop: 1}}>
                {status === 'TO_CONTACT' ? (
                    <>
                        <Typography sx={{marginRight: 4}}>
                            Optionel <br/>
                            Valeur potentielle du contrat en €
                        </Typography>
                        <BpNumberField style={{width: '45%'}} name='contractAmount' label='Montant'/>
                    </>
                ) : (
                    <>
                        <Typography sx={{marginRight: 4}}>
                            Obligatoire <br/>
                            Valeur potentielle du contrat en €
                        </Typography>
                        <BpNumberField style={{width: '45%'}} name='contractAmount' label='Montant' required/>
                    </>
                )}
            </Box>
        </ProspectDialog>
    );
};

export default UpdateModal;
