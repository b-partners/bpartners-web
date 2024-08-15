import { BoxProps } from '@mui/material';
import { ReactNode } from 'react';

export interface ErrorHandlingProps {
  message: string;
}

export interface PdfViewerProps extends BoxProps {
  url: string;
  filename: string;
  isPending: boolean;
  noData: ReactNode | string;
  onLoadError: ReactNode | string;
}
