import { useEffect } from 'react';
import { useSidebarState } from 'react-admin';
import { useIsTablet } from './use-is-tablet';

export const useCollapseSidebarOnTablet = () => {
  const isTablet = useIsTablet();
  const [, setOpen] = useSidebarState();

  useEffect(() => {
    if (isTablet) setOpen(false);
  }, [isTablet, setOpen]);
};
