import { useToggle } from '@/common/hooks';
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { FC } from 'react';
import { BpTextField } from './BpTextField';
import { BpFieldProps } from './types';

export const BpPasswordField: FC<BpFieldProps> = props => {
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
