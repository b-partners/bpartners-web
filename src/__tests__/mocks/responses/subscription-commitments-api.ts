import { EnableStatus, UserSubscriptionCommitment, UserSubscriptionCommitmentDuration } from '@bpartners/typescript-client';

const now = new Date();

const addYears = (date: Date, years: number) => new Date(new Date(date).setFullYear(date.getFullYear() + years));

export const ongoingSubscriptionCommitments: UserSubscriptionCommitment[] = [
  {
    id: 'commitment-ongoing',
    duration: UserSubscriptionCommitmentDuration.TWELVE_MONTHS,
    commitmentStart: now,
    commitmentEnd: addYears(now, 1),
    approvalDatetime: now,
    automaticRenewalStatus: EnableStatus.DISABLED,
  },
];

export const expiredSubscriptionCommitments: UserSubscriptionCommitment[] = [
  {
    id: 'commitment-expired',
    duration: UserSubscriptionCommitmentDuration.TWELVE_MONTHS,
    commitmentStart: addYears(now, -2),
    commitmentEnd: addYears(now, -1),
    approvalDatetime: addYears(now, -2),
    automaticRenewalStatus: EnableStatus.DISABLED,
  },
];
