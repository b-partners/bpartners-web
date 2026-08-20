import { useDialog } from '@/common/store/dialog';
import { CREDIT_BALANCE_QUERY_KEY } from '@/operations/account/queries';
import { getCreditBalance } from '@/providers';
import { useQueryClient } from '@tanstack/react-query';
import { CreditsRequiredModalContent } from './CreditsRequiredModalContent';
import { CreditsRequiredModalStyle } from './style';

export const useCreditRequirement = () => {
  const { open } = useDialog();
  const queryClient = useQueryClient();

  const openCreditsRequiredModal = () => open(<CreditsRequiredModalContent />, { maxWidth: 'lg', fullWidth: true, sx: CreditsRequiredModalStyle }, false);

  const requireCredits = async () => {
    try {
      const balance = await queryClient.fetchQuery({ queryKey: CREDIT_BALANCE_QUERY_KEY, queryFn: getCreditBalance, staleTime: 0 });
      const requiredCredits = balance?.creditCostPerAnalysis ?? 1;
      if ((balance?.spendableCredits ?? 0) >= requiredCredits) return true;
      openCreditsRequiredModal();
      return false;
    } catch {
      return true;
    }
  };

  return { requireCredits, openCreditsRequiredModal };
};
