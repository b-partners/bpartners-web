import { TextFieldProps } from '@mui/material';
import { ReactNode } from 'react';
import { FunctionFieldProps, TextInputProps } from 'react-admin';

export interface BpFieldProps extends TextFieldProps<'filled'> {
  name: string;
  icon?: ReactNode;
  onClickOnIcon?: () => void;
}

export interface RaNumberFieldProps extends FunctionFieldProps {
  map?: boolean;
  render: (data: any) => number;
}

export interface RaNumberInputProps extends TextInputProps {
  icon?: ReactNode;
  endText?: string;
}
