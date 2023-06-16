import PdfViewer from "src/common/components/PdfViewer"
import { IconButton } from "@mui/material"
import { Refresh as RefreshIcon } from "@mui/icons-material"
import { PDF_EDITION_WIDTH } from "../utils/utils"
import { useInvoiceContext, useInvoiceContextRequest } from "src/common/hooks"
import { handleSubmit } from "src/common/utils"

export const InvoiceFormPdf = () => {
    const { state: { documentUrl, invoice, updatePendingNumbers } } = useInvoiceContext()
    const { saveOrUpdateInvoice } = useInvoiceContextRequest()

    return (
        <PdfViewer width={PDF_EDITION_WIDTH} url={documentUrl} filename={invoice?.ref} isPending={updatePendingNumbers > 0}>
            <IconButton id='form-refresh-preview' onClick={handleSubmit(() => saveOrUpdateInvoice(invoice))} size='small' title='Rafraîchir'>
                <RefreshIcon />
            </IconButton>
        </PdfViewer>
    )
}