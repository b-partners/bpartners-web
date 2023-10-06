import { useState } from 'react';

type TypedToggleParams<T> = {
  defaultType: T;
  defaultValue?: boolean;
};

type TypedToggleState<T> = {
  type: T;
  value: boolean;
};

export const useTypedToggle = <T>({ defaultType, defaultValue }: TypedToggleParams<T>) => {
  const [{ type: currentType, value: status }, setState] = useState<TypedToggleState<T>>({ type: defaultType, value: defaultValue || false });

  const getToggleStatus = (type: T) => {
    if (type === currentType) {
      return status;
    } else {
      return false;
    }
  };

  const setToggleStatus = (type: T, value?: boolean) => {
    setState({ type, value: value || !status });
  };

  return { getToggleStatus, setToggleStatus };
};
