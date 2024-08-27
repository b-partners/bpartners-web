import { useCallback } from 'react';
import { RichToolbarButton } from './RichToolbarButton';

export const RichRenderEditorFunc = ({ reg = [], onToggle, isActive }: any) => {
  const renderAll = useCallback(
    () =>
      reg.map((type: any, k: any) => (
        <RichToolbarButton key={type.label + k} active={isActive(type.style)} onToggle={onToggle} label={type.label} style={type.style}>
          {type.icon}
        </RichToolbarButton>
      )),
    [isActive, onToggle, reg]
  );

  return renderAll();
};
