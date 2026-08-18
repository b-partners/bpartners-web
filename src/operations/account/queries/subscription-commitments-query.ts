import { getSubscriptionCommitments } from '@/providers';
import { UserSubscriptionCommitment } from '@bpartners/typescript-client';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

const isOngoing = ({ commitmentEnd }: UserSubscriptionCommitment) => !commitmentEnd || dayjs(commitmentEnd).isAfter(dayjs());

const byMostRecentStart = (a: UserSubscriptionCommitment, b: UserSubscriptionCommitment) =>
  dayjs(b.commitmentStart).valueOf() - dayjs(a.commitmentStart).valueOf();

const toOngoingCommitment = (commitments: UserSubscriptionCommitment[]) => [...commitments].filter(isOngoing).sort(byMostRecentStart)[0];

export const useGetOngoingSubscriptionCommitment = (enabled = true) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['SubscriptionCommitmentsQuery'],
    queryFn: getSubscriptionCommitments,
    select: toOngoingCommitment,
    enabled,
  });
  return {
    commitment: data,
    isCommitmentUnknown: enabled && (isLoading || isError),
  };
};
