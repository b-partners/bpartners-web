import { Invoice, InvoicePaymentTypeEnum, PaymentRegulation } from 'bpartners-react-client';
import { getNextMonthDate } from 'src/common/utils/date';
import emptyToNull from 'src/common/utils/empty-to-null';
import { toMajors, toMinors } from 'src/common/utils/percent';

// Payment regulation
export const PAYMENT_TYPE = 'paymentType';
export const PAYMENT_REGULATIONS = 'paymentRegulations';

export const DefaultPaymentRegulation: any = {
  percent: 10,
  comment: null,
  maturityDate: new Date().toLocaleDateString('fr-ca'),
};

export const ScreenMode = {
  VIEW: false,
  EDIT: true,
};

export const paymentRegulationErrorMessage = `Si vous choisissez le mode de paiement par acompte, veuillez ajouter au moins un paiement`;

export const validatePaymentRegulation = (paymentRegulationType: InvoicePaymentTypeEnum, paymentRegulation: any[]) => {
  if (paymentRegulationType === InvoicePaymentTypeEnum.IN_INSTALMENT && (paymentRegulation || []).length === 0) {
    return true;
  }
  return false;
};

export type TPaymentRegulation = {
  /**TODO: payment regulation type in code gen if different to this**/
  amount: number;
  percent: number;
  comment: string;
  maturityDate: string;
};

export const getPercentValue = (paymentRegulation: any) => paymentRegulation.percent || paymentRegulation.paymentRequest.percentValue;

export const sumOfRegulationsPercentages = (paymentRegulations: TPaymentRegulation[]) => {
  if (!paymentRegulations || paymentRegulations.length === 0) {
    return 100;
  }
  const paymentRegulationsPercentages = paymentRegulations.map(paymentRegulation => +getPercentValue(paymentRegulation)).reduce((a, b) => a + b, 0);
  return 100 - paymentRegulationsPercentages;
};

type ValidateRegulationPercentage = {
  value: string;
  paymentRegulations: TPaymentRegulation[];
};

export const validateRegulationPercentage = (params: ValidateRegulationPercentage) => {
  const { paymentRegulations, value } = params;
  const restOfPercentages = sumOfRegulationsPercentages(paymentRegulations);

  if (value.length === 0) {
    return 'Ce champ est requis';
  } else if (+value > restOfPercentages) {
    return `Les mensualités ne doivent pas dépasser les 100%, veuillez utiliser un mensualité inférieur ou égale a ${restOfPercentages}%`;
  }
  return true;
};

export const missingPaymentRegulation = (paymentRegulations: any[]): any => {
  const currentDate = new Date().toLocaleDateString('fr-ca');
  let newPaymentRegulation: TPaymentRegulation = {
    amount: null,
    percent: 100,
    comment: null,
    maturityDate: getNextMonthDate(currentDate),
  };
  if (!paymentRegulations || paymentRegulations.length === 0) {
    return newPaymentRegulation;
  }
  const percent = sumOfRegulationsPercentages(paymentRegulations);
  const maturityDate = getNextMonthDate(
    paymentRegulations.sort((a, b) => new Date(b.maturityDate).getTime() - new Date(a.maturityDate).getTime())[0].maturityDate
  );
  return { ...newPaymentRegulation, percent, maturityDate };
};

export enum MoneyUnity {
  MAJOR = 'MAJOR',
  MINOR = 'MINOR',
}

const toDomainPaymentRegulationMoneyUnity = (paymentRegulation: TPaymentRegulation, to: MoneyUnity) => {
  const changeUnity = to === MoneyUnity.MAJOR ? toMajors : toMinors;
  return {
    ...paymentRegulation,
    amount: paymentRegulation.amount ? changeUnity(paymentRegulation.amount) : null,
    percent: paymentRegulation.percent ? changeUnity(paymentRegulation.percent) : null,
  };
};

const toRestPaymentRegulationMoneyUnity = (paymentRegulations: PaymentRegulation, to: MoneyUnity): PaymentRegulation => {
  const changeUnity = to === MoneyUnity.MAJOR ? toMajors : toMinors;
  const {
    paymentRequest: { amount, percentValue },
  } = paymentRegulations;

  return {
    ...paymentRegulations,
    paymentRequest: { ...paymentRegulations.paymentRequest, amount: changeUnity(amount), percentValue: changeUnity(percentValue) },
  };
};
export const paymentRegulationMoneyUnity = (paymentRegulations: any[], to: MoneyUnity) =>
  paymentRegulations.map(paymentRegulation =>
    paymentRegulation.amount ? toDomainPaymentRegulationMoneyUnity(paymentRegulation, to) : toRestPaymentRegulationMoneyUnity(paymentRegulation, to)
  );

export const paymentRegulationToMajor = (paymentRegulation: any[]) => paymentRegulationMoneyUnity(paymentRegulation, MoneyUnity.MAJOR);
export const paymentRegulationToMinor = (paymentRegulation: any[]) => paymentRegulationMoneyUnity(paymentRegulation, MoneyUnity.MINOR);

export const invoiceToRest = (_invoice: Invoice) => {
  const invoice = { ..._invoice };
  if (invoice.paymentType === InvoicePaymentTypeEnum.CASH) {
    invoice.paymentRegulations = null;
  } else {
    const paymentRegulationTo100Percent = missingPaymentRegulation(invoice.paymentRegulations);
    if (paymentRegulationTo100Percent.percent !== 0) {
      invoice.paymentRegulations.push(paymentRegulationTo100Percent);
    }
  }

  return emptyToNull(invoice);
};
