import { useIsTablet } from '@/common/hooks';
import { Drawer } from '@mui/material';
import { FC, ReactElement, useEffect } from 'react';
import { Sidebar, useSidebarState } from 'react-admin';
import { useLocation } from 'react-router-dom';
import { AppSidebarStyle } from './style';

interface AppSidebarProps {
  children: ReactElement;
}

export const AppSidebar: FC<AppSidebarProps> = ({ children, ...rest }) => {
  const isTablet = useIsTablet();
  const [open, setOpen] = useSidebarState();
  const { pathname } = useLocation();

  useEffect(() => {
    if (isTablet) setOpen(false);
  }, [pathname, isTablet, setOpen]);

  if (!isTablet) return <Sidebar {...rest}>{children}</Sidebar>;

  return (
    <Drawer sx={AppSidebarStyle} variant='temporary' open={open} onClose={() => setOpen(false)} ModalProps={{ keepMounted: true }}>
      {children}
    </Drawer>
  );
};
