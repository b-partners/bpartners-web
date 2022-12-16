const STANDARD_VAT_RATE = 20;

export const getPriceInclVat = (priceExclTax: number, rate = STANDARD_VAT_RATE) => getVat(priceExclTax, rate) + priceExclTax;

export const getVat = (priceExclTax: number, rate = STANDARD_VAT_RATE) => (priceExclTax / 100) * rate;
