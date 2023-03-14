import { InvoicePaymentTypeEnum, PaymentRegulation } from 'bpartners-react-client';
import { getNextMonthDate } from 'src/common/utils/date';
import { toMajors, toMinors } from 'src/common/utils/percent';

// Payment regulation
export const PAYMENT_TYPE = 'paymentType';
export const PAYMENT_REGULATIONS = 'paymentRegulations';

export const DefaultPaymentRegulation: any = {
  percent: 3000,
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

export const getPercentValue = (paymentRegulation: any) => +(paymentRegulation.percent || paymentRegulation.paymentRequest.percentValue);

export const sumOfRegulationsPercentages = (paymentRegulations: TPaymentRegulation[], indexOfSkipped?: number) => {
  if (!paymentRegulations || paymentRegulations.length === 0) {
    return 100;
  }

  const paymentRegulationsPercentages = paymentRegulations
    .map((paymentRegulation, index) => (indexOfSkipped === index ? 0 : +getPercentValue(paymentRegulation)))
    .reduce((a, b) => a + b, 0);
  return 100 - paymentRegulationsPercentages;
};

type ValidateRegulationPercentage = {
  value: string;
  paymentRegulations: TPaymentRegulation[];
  indexOfSkipped?: number;
};

export const validateRegulationPercentage = (params: ValidateRegulationPercentage) => {
  const { paymentRegulations, value, indexOfSkipped } = params;
  const restOfPercentages = sumOfRegulationsPercentages(paymentRegulations, indexOfSkipped);

  if (value.length === 0) {
    return 'Ce champ est requis';
  } else if (+value > restOfPercentages) {
    return `Les mensualités ne doivent pas dépasser les 100%, veuillez utiliser un mensualité inférieur ou égale a ${restOfPercentages}%`;
  }
  return true;
};

export const missingPaymentRegulation = (paymentRegulations: any[], date?: string): any => {
  let newPaymentRegulation: TPaymentRegulation = {
    amount: null,
    percent: 100,
    comment: null,
    maturityDate: date,
  };
  if (!paymentRegulations || paymentRegulations.length === 0) {
    return newPaymentRegulation;
  }
  const percent = sumOfRegulationsPercentages(paymentRegulations);

  return { ...newPaymentRegulation, percent };
};

export enum MoneyUnity {
  MAJOR = 'MAJOR',
  MINOR = 'MINOR',
}

const domainPaymentRegulationMoneyUnity = (paymentRegulation: TPaymentRegulation, to: MoneyUnity) => {
  const changeUnity = (pR: any) => (to === MoneyUnity.MAJOR ? toMajors(pR) : toMinors(pR));
  return {
    ...paymentRegulation,
    amount: paymentRegulation.amount ? changeUnity(paymentRegulation.amount) : null,
    percent: paymentRegulation.percent ? changeUnity(paymentRegulation.percent) : null,
  };
};

const restPaymentRegulationMoneyUnity = (paymentRegulation: PaymentRegulation, to: MoneyUnity): TPaymentRegulation => {
  const changeUnity = (pR: any) => (to === MoneyUnity.MAJOR ? toMajors(pR) : toMinors(pR));
  const {
    paymentRequest: { percentValue },
    maturityDate,
  } = paymentRegulation;

  return { amount: null, percent: changeUnity(percentValue), comment: null, maturityDate };
};
export const paymentRegulationMoneyUnity = (paymentRegulations: any[], to: MoneyUnity) =>
  paymentRegulations.map(paymentRegulation =>
    paymentRegulation.percent ? domainPaymentRegulationMoneyUnity(paymentRegulation, to) : restPaymentRegulationMoneyUnity(paymentRegulation, to)
  );

export const paymentRegulationToMajor = (paymentRegulation: any[]) => paymentRegulationMoneyUnity(paymentRegulation, MoneyUnity.MAJOR);
export const paymentRegulationToMinor = (paymentRegulation: any[]) => paymentRegulationMoneyUnity(paymentRegulation, MoneyUnity.MINOR);
