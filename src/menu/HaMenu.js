import { MenuItemCategory, MultiLevelMenu } from '@react-admin/ra-navigation';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

const HaMenu = () => {
  return (
    <MultiLevelMenu variant='categories'>
      <MenuItemCategory to='/profile' name='profile' label='Mon profil' icon={<AccountCircleIcon />} />
    </MultiLevelMenu>
  );
};

export default HaMenu;
