import { Box, BoxProps } from '@mui/material';
import { FC, ReactNode } from 'react';

export type TabPanelProps = BoxProps & {
  children?: ReactNode;
  value?: number;
  index?: number;
};

const TabPanel: FC<TabPanelProps> = props => {
  const { children, value, index, ...other } = props;

  return (
    <Box role='tabpanel' hidden={value !== index} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && children}
    </Box>
  );
};

export default TabPanel;
