import { getCached } from '@/providers';
import { AccountHolder } from '@bpartners/typescript-client';
import { SirenModal } from '../components/SirenModal';
import { useDialog } from '../store/dialog';

export const hasSiren = (accountHolder?: AccountHolder) => !!(accountHolder ?? getCached.accountHolder())?.siren;

export const useSirenRequirement = () => {
  const { open } = useDialog();

  const openSirenModal = (onSuccess?: () => void) => open(<SirenModal onSuccess={onSuccess} />, undefined, false);

  const requireSiren = (onSuccess?: () => void) => {
    if (hasSiren()) return true;
    openSirenModal(onSuccess);
    return false;
  };

  return { requireSiren, openSirenModal };
};
