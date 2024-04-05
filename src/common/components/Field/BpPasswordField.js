import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { useState } from 'react';
import { BpTextField } from './BpTextField';

export const BpPasswordField = props => {
  const [isVisible, setVisibility] = useState(false);

  const handleToggle = () => setVisibility(e => !e);

  return (
    <BpTextField {...props} type={isVisible ? 'text' : 'password'} onClickOnIcon={handleToggle} icon={isVisible ? <VisibilityOffIcon /> : <VisibilityIcon />} />
  );
};
