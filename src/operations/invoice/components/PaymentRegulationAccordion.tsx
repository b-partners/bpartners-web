import { Invoice } from "bpartners-react-client";
import InvoiceAccordion from "./InvoiceAccordion";
import { useWatch, useFormContext } from "react-hook-form";
import { Dispatch, SetStateAction } from "react";
import { FormControl, FormControlLabel, Checkbox } from "@mui/material";
import { DEFAULT_TEXT_FIELD_WIDTH } from "../style";
import { PaymentRegulationsForm } from "./PaymentRegulationsForm";

type PaymentRegulationAccordionProps = {
    isExpanded: boolean;
    onExpand: Dispatch<SetStateAction<number>>
}

export const PaymentRegulationAccordion = (props: PaymentRegulationAccordionProps) => {
    const invoice: Invoice = useWatch();
    const { formState, setValue } = useFormContext<Invoice>()
    const isPaymentInInstalment = invoice.paymentType === "IN_INSTALMENT"

    const togglePaymentType = () => {
        if (isPaymentInInstalment) {
            setValue("paymentRegulations", null);
        }
        setValue("paymentType", isPaymentInInstalment ? "CASH" : "IN_INSTALMENT");
    };

    return <>
        <FormControl sx={{ width: DEFAULT_TEXT_FIELD_WIDTH }}>
            <FormControlLabel
                control={<Checkbox data-testid='payment-regulation-checkbox-id' checked={isPaymentInInstalment} onChange={togglePaymentType} />}
                label='Payer en plusieurs fois'
            />
        </FormControl>
        {isPaymentInInstalment && <InvoiceAccordion error={!!formState.errors["paymentRegulations"]} label='Acompte' index={3}  {...props}>
            <PaymentRegulationsForm />
        </InvoiceAccordion>}
    </>
}