import { getCreditPacks } from '@/providers';
import { CreditPack } from '@bpartners/typescript-client';
import { useQuery } from '@tanstack/react-query';

const toDisplayablePacks = (packs: CreditPack[]) =>
  packs.filter(({ isDeprecated }) => !isDeprecated).sort((a, b) => (a.displayPosition ?? Infinity) - (b.displayPosition ?? Infinity));

export const useGetCreditPacks = (enabled = true) => {
  const { data = [], isLoading, isError } = useQuery({ queryKey: ['CreditPacksQuery'], queryFn: getCreditPacks, select: toDisplayablePacks, enabled });
  return {
    packs: data,
    isPacksLoading: isLoading,
    isPacksError: isError,
  };
};
