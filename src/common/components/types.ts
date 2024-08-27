import * as Icons from '@mui/icons-material';
import { AutocompleteProps, IconButtonProps, SxProps, TextFieldProps } from '@mui/material';

export interface BpAutoCompleteProps extends AutocompleteProps<any, any, any, any> {
  name: string;
  label: string;
}

export interface BpFormFieldProps extends Omit<TextFieldProps, 'style'> {
  name: string;
  label: string;
  validate?: any;
  shouldValidate?: boolean;
  style?: SxProps;
}

export interface IconTipButtonProps extends IconButtonProps {
  icon: keyof typeof Icons;
  title: string;
}
