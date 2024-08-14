import { AutocompleteProps, SxProps, TextFieldProps } from '@mui/material';

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
