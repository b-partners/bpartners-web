import { authProvider } from '@/providers';

export const useIsSecondaryUser = () => authProvider.isSecondaryUser();
