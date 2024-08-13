import { AutocompleteProps } from '@mui/material';
import { TextFieldProps } from 'react-admin';

export interface BpAutoCompleteProps extends AutocompleteProps<any, any, any, any> {
  name: string;
  label: string;
}

export interface BpFormFieldProps extends TextFieldProps {
  name: string;
  label: string;
  validate: any;
  shouldValidate?: boolean;
}
