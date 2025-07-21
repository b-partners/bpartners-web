import * as Icons from '@mui/icons-material';
import { AutocompleteProps, IconButtonProps, SxProps, TextFieldProps } from '@mui/material';

export interface BpAutoCompleteProps extends Omit<AutocompleteProps<any, any, any, any>, 'renderInput'> {
  name: string;
  label: string;
}

export interface BpAutoCompleteBackendProps<T> extends Omit<BpAutoCompleteProps, 'options'> {
  fetcher: (value: string) => Promise<T[]>;
  textFieldProps?: TextFieldProps['inputProps'];
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
