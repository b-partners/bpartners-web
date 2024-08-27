import { FormatBold as FormatBoldIcon, FormatItalic as FormatItalicIcon, FormatStrikethrough as FormatStrikethroughIcon } from '@mui/icons-material';
import { ButtonGroup } from '@mui/material';
import { FC } from 'react';
import { RichRenderEditorFunc } from './RichRenderEditorFunc';
import { RichControlsProps } from './types';

const INLINE_TYPES = [
  { label: 'Bold', icon: <FormatBoldIcon />, style: 'BOLD' },
  { label: 'Italic', icon: <FormatItalicIcon />, style: 'ITALIC' },
  { label: 'Strikethrough', icon: <FormatStrikethroughIcon />, style: 'STRIKETHROUGH' },
];

export const InlineControls: FC<RichControlsProps> = ({ editorState, onToggle }) => {
  const isActive = (key: string) => editorState.getCurrentInlineStyle().has(key);

  return (
    <ButtonGroup>
      <RichRenderEditorFunc reg={INLINE_TYPES} isActive={isActive} onToggle={onToggle} />
    </ButtonGroup>
  );
};
