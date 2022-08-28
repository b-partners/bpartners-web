import { AppBar } from '@react-admin/ra-enterprise';

import { IconButton, Tooltip } from '@material-ui/core';
import LockIcon from '@material-ui/icons/Lock';
import authProvider from './providers/auth-provider';

const UserMenu = () => {
  const logout = () => {
    authProvider.logout();
    window.location.reload();
  };
  return (
    <Tooltip title='Se déconnecter' onClick={logout} color="primary">
      <IconButton color='inherit'>
        <LockIcon />
      </IconButton>
    </Tooltip>
  );
};

const appBarStyle = {
  backgroundColor: '#6D213C',
  color: '#fff'
}

const HaAppBar = props => (
  <AppBar {...props}
    sx={appBarStyle}
    languages={[]}
    elevation={0}
    userMenu={<UserMenu {...props} />}
  />
);
export default HaAppBar;
