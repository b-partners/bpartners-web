import { TRANSPARENT_BUTTON_STYLE } from '@/security/style';
import { Button } from '@mui/material';
import React from 'react';

interface ExternalLinkButtonProps {
  url: string;
  children: React.ReactNode;
}

const ExternalLinkButton: React.FC<ExternalLinkButtonProps> = ({ url, children, ...others }) => {
  const buttonStyle = {
    ...TRANSPARENT_BUTTON_STYLE,
  };

  return (
    <Button {...others} sx={buttonStyle} onClick={() => window.open(url, '_blank', 'noopener')}>
      {children}
    </Button>
  );
};

export default ExternalLinkButton;
