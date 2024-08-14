import { Box, Chip, FormHelperText, SxProps, TextField, TextFieldProps, Typography } from '@mui/material';
import { ChangeEvent, CSSProperties, FC, FormEvent, useState } from 'react';
import { useTranslate } from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';
import { BPButton } from './BPButton';

type BpMultipleTextInputProps = TextFieldProps & {
  name: string;
  label: string;
  validator?: (value: string) => { error: boolean; message?: string };
};

const CHIP_CONTAINER: SxProps = {
  display: 'flex',
  justifyContent: 'flex-start',
  flexWrap: 'wrap',
  gap: 0.5,
  maxHeight: 100,
  overflowY: 'auto',
  paddingBlock: 2,
};

const CUSTOM_BUTTON: SxProps = {
  width: '100px',
  height: '48px',
  borderRadius: '0 4px 4px 0',
  marginBottom: '4px',
};

const ERROR_BORDER = {
  borderBottom: '2px solid #d32f2f',
};
const BORDER = {
  borderBottom: '1px solid rgba(0, 0, 0, 0.42)',
};

const CUSTOM_INPUT: SxProps = { flexGrow: 2, border: '4px 0 0 0' };

const ACTION_CONTAINER: CSSProperties = { display: 'flex', alignItems: 'flex-end' };

export const BpMultipleTextInput: FC<BpMultipleTextInputProps> = ({ name, label, title, validator }) => {
  const {
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext();
  const selected = useWatch({ name, defaultValue: [] }) || [];
  const translate = useTranslate();
  const [state, setState] = useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState(event?.target?.value);
    if (errors[name]) {
      clearErrors(name);
    }
  };
  const handleDelete = (title: string) =>
    setValue(
      name,
      selected.filter((value: string) => value !== title)
    );
  const handleAdd = () => {
    if (selected.filter((value: string) => value === state).length !== 0) {
      setError(name, { message: `${state} à déjà été ajouté.` });
    } else if (!!validator && validator(state).error) {
      setError(name, { message: validator(state).message });
    } else if (state && state.length !== 0) {
      setValue(name, [...selected, state]);
      setState('');
    }
  };
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleAdd();
  };

  return (
    <Box>
      <Typography variant='body1'>{title}</Typography>
      <Box sx={CHIP_CONTAINER}>
        {selected.map((title: string) => (
          <Chip key={`BpMultipleTextInput-${title}`} label={title} onDelete={() => handleDelete(title)} />
        ))}
      </Box>
      <form onSubmit={handleSubmit} style={ACTION_CONTAINER}>
        <TextField name={name} error={!!errors[name]} sx={CUSTOM_INPUT} label={translate(label, { smart_count: 2 })} value={state} onChange={handleChange} />
        <BPButton
          disabled={!state || state.length === 0}
          label='ra.action.add'
          onClick={handleAdd}
          style={{ ...CUSTOM_BUTTON, ...(errors[name] ? ERROR_BORDER : BORDER) } as CSSProperties}
        />
      </form>
      {/* cannot use TextField props helperText because of the BpButton static style */}
      {!!errors[name] && <FormHelperText error>{errors[name].message as string}</FormHelperText>}
    </Box>
  );
};
