import { Dispatch, SetStateAction, useState } from 'react';

type UseToggleReturnType = {
  value: boolean;
  setValue: Dispatch<SetStateAction<boolean>>;
  toggleValue: () => void;
  handleOpen: () => void;
  handleClose: () => void;
};

export const useToggle = (defaultValue = false): UseToggleReturnType => {
  const [value, setValue] = useState(defaultValue);

  return {
    value,
    setValue,
    toggleValue: () => {
      setValue(prev => !prev);
    },
    handleOpen: () => {
      setValue(true);
    },
    handleClose: () => {
      setValue(false);
    },
  };
};
