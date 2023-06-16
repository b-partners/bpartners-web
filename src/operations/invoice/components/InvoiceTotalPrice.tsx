import { prettyPrintMinors } from "src/common/utils";
import { Typography, Box } from "@mui/material"
import { useMemo } from "react";
import { useWatch } from "react-hook-form"
import { Invoice } from "bpartners-react-client";
import { totalPriceWithVatFromProducts, totalPriceWithoutVatFromProducts } from "../utils/utils";

const STYLE = { width: 300, display: 'flex', justifyContent: 'space-between', marginBlock: 5 };

export const InvoiceTotalPrice = () => {
    const { products } = useWatch<Invoice>()
    // const { isSubjectToVat, totalPrice } = props;
    const isSubjectToVat = false

    const totalPrice = useMemo(() => isSubjectToVat ? totalPriceWithVatFromProducts(products) : totalPriceWithoutVatFromProducts(products)
        , [isSubjectToVat, products])

    return (
        <Box sx={STYLE}>
            <Typography variant='h6'>{isSubjectToVat ? 'Total TTC' : 'Total HT'}</Typography>
            <Typography variant='h6'>{prettyPrintMinors(totalPrice)}</Typography>
        </Box>
    );
}