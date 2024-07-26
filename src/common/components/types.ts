import { AutocompleteProps } from '@mui/material';

export interface BpAutoCompleteProps extends AutocompleteProps<any, any, any, any> {
  name: string;
  label: string;
}
