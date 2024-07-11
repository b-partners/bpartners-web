import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { useToggle } from 'src/common/hooks';
import { BpTextField } from './BpTextField';

export const BpPasswordField = props => {
  const { value: isVisible, toggleValue: toggleVisibility } = useToggle();

  return (
    <BpTextField
      {...props}
      type={isVisible ? 'text' : 'password'}
      onClickOnIcon={toggleVisibility}
      icon={isVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
    />
  );
};
