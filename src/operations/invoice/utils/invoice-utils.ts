import { Invoice, InvoicePaymentTypeEnum } from 'bpartners-react-client';
import { formatDateTo8601 } from 'src/common/utils/date';
import emptyToNull from 'src/common/utils/empty-to-null';
import { toMajors } from 'src/common/utils/money';
import { toMinors } from 'src/common/utils/percent';
import {
  DefaultPaymentRegulation,
  missingPaymentRegulation,
  paymentRegulationToMajor,
  paymentRegulationToMinor,
  PAYMENT_REGULATIONS,
} from './payment-regulation-utils';
import {
  DEFAULT_DELAY_PENALTY_PERCENT,
  DEFAULT_GLOBAL_DISCOUNT,
  DELAY_PENALTY_PERCENT,
  GLOBAL_DISCOUNT,
  GLOBAL_DISCOUNT_PERCENT_VALUE,
  PERCENT_VALUE,
  SENDING_DATE,
  VALIDITY_DATE,
} from './utils';

export const invoiceMapper = {
  toDomain: (_invoice: any): Invoice => {
    const invoice = { ..._invoice };
    invoice[DELAY_PENALTY_PERCENT] = toMajors(_invoice[DELAY_PENALTY_PERCENT]) || DEFAULT_DELAY_PENALTY_PERCENT;
    invoice[GLOBAL_DISCOUNT] =
      invoice[GLOBAL_DISCOUNT] && _invoice[GLOBAL_DISCOUNT][PERCENT_VALUE] ? { percentValue: toMajors(_invoice[GLOBAL_DISCOUNT][PERCENT_VALUE]) } : null;
    invoice[PAYMENT_REGULATIONS] = paymentRegulationToMajor(_invoice[PAYMENT_REGULATIONS] || [DefaultPaymentRegulation]);

    return invoice;
  },
  toRest: (_invoice: any): Invoice => {
    const submittedAt = new Date();
    const delayPenaltyPercent = toMinors(parseInt(_invoice[DELAY_PENALTY_PERCENT]));
    const currentGlobalDiscount = _invoice[GLOBAL_DISCOUNT] && _invoice[GLOBAL_DISCOUNT][PERCENT_VALUE];
    const globalDiscount = isNaN(currentGlobalDiscount) || +currentGlobalDiscount === 0 ? null : { percentValue: toMinors(+currentGlobalDiscount) };

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
      const paymentRegulationTo100Percent = { ...missingPaymentRegulation(invoice.paymentRegulations), maturityDate: invoice[VALIDITY_DATE] };
      if (paymentRegulationTo100Percent.percent !== 0) {
        invoice.paymentRegulations = paymentRegulationToMinor([...invoice.paymentRegulations, paymentRegulationTo100Percent]);
      }
    }
    return emptyToNull(invoice);
  },
};
