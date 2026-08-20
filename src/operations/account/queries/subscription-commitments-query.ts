import { getSubscriptionCommitments } from '@/providers';
import { UserSubscriptionCommitment } from '@bpartners/typescript-client';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

const toTimestamp = ({ approvalDatetime, commitmentStart, commitmentEnd }: UserSubscriptionCommitment) => {
  const date = approvalDatetime ?? commitmentStart ?? commitmentEnd;
  const timestamp = date ? dayjs(date).valueOf() : Number.NaN;
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const byMostRecent = (a: UserSubscriptionCommitment, b: UserSubscriptionCommitment) => toTimestamp(b) - toTimestamp(a);

const toLatestCommitment = (commitments: UserSubscriptionCommitment[]) => [...commitments].sort(byMostRecent)[0];

export const useGetLatestSubscriptionCommitment = (enabled = true) => {
  const { data } = useQuery({
    queryKey: ['SubscriptionCommitmentsQuery'],
    queryFn: getSubscriptionCommitments,
    select: toLatestCommitment,
    enabled,
  });
  return { commitment: data };
};
