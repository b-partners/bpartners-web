import { ReactElement, useState } from "react";
import { InvoiceModalContext, invoiceModalInitialState } from "src/common/store";

type Props = {
    children: ReactElement
}

export const InvoiceModalContextProvider = ({ children }: Props) => {
    const [modal, setModal] = useState(invoiceModalInitialState)

    return (
        <InvoiceModalContext.Provider value={{ setModal, modal }} >
            {children}
        </InvoiceModalContext.Provider>
    )
};