import { Invoice, InvoicePaymentTypeEnum } from 'bpartners-react-client';
import { formatDateTo8601 } from 'src/common/utils/date';
import emptyToNull from 'src/common/utils/empty-to-null';
import isBlankNumber from 'src/common/utils/isBlank';
import { toMajors, toMinors } from 'src/common/utils/money';
import {
  DefaultPaymentRegulation,
  missingPaymentRegulation,
  paymentRegulationToMajor,
  paymentRegulationToMinor,
  PAYMENT_REGULATIONS,
} from './payment-regulation-utils';
import { DELAY_IN_PAYMENT_ALLOWED, DELAY_PENALTY_PERCENT, GLOBAL_DISCOUNT, PERCENT_VALUE, SENDING_DATE, VALIDITY_DATE } from './utils';

export const invoiceMapper = {
  toDomain: (_invoice: any): Invoice => {
    const invoice = { ..._invoice };

    const delayPenaltyPercent = !isBlankNumber(_invoice[DELAY_PENALTY_PERCENT]) ? toMajors(_invoice[DELAY_PENALTY_PERCENT]) : null;

    const globalDiscount =
      invoice[GLOBAL_DISCOUNT] && invoice[GLOBAL_DISCOUNT][PERCENT_VALUE] !== 0 ? `${toMajors(_invoice[GLOBAL_DISCOUNT][PERCENT_VALUE])}` : null;

    const paymentRegulations = paymentRegulationToMajor(_invoice[PAYMENT_REGULATIONS] || [DefaultPaymentRegulation]);
    const delayInPaymentAllowed = !isBlankNumber(_invoice[DELAY_IN_PAYMENT_ALLOWED]) ? _invoice[DELAY_IN_PAYMENT_ALLOWED] : null;
    return { ...invoice, delayPenaltyPercent, globalDiscount, paymentRegulations, delayInPaymentAllowed };
  },
  toRest: (_invoice: any): Invoice => {
    const submittedAt = new Date();
    const delayPenaltyPercent = toMinors(parseInt(_invoice[DELAY_PENALTY_PERCENT]));
    const globalDiscount = _invoice[GLOBAL_DISCOUNT] !== null ? { percentValue: toMinors(_invoice[GLOBAL_DISCOUNT]) } : null;

    const invoice = {
      ..._invoice,
      globalDiscount,
      delayPenaltyPercent,
      sendingDate: formatDateTo8601(_invoice[SENDING_DATE], '00:00:00'),
      validityDate: formatDateTo8601(_invoice[VALIDITY_DATE], '23:59:59'),
      metadata: { ..._invoice.metadata, submittedAt: submittedAt.toISOString() },
    };

    if (invoice.paymentType === InvoicePaymentTypeEnum.CASH) {
      invoice.paymentRegulations = null;
    } else {
      const paymentRegulationTo100Percent = { ...missingPaymentRegulation(invoice.paymentRegulations) };
      const domainPR =
        paymentRegulationTo100Percent.percent !== 0 ? [...invoice.paymentRegulations, paymentRegulationTo100Percent] : invoice.paymentRegulations;
      invoice.paymentRegulations = paymentRegulationToMinor(domainPR);
    }
    return emptyToNull(invoice);
  },
};
