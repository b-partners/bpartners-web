import { Stack } from '@mui/material';
import { RichUtils } from 'draft-js';
import { FC } from 'react';
import { RichAttachementInput } from './RichAttachementInput';
import { RichBlockControls } from './RichBlockControls';
import { InlineControls } from './RichInlineControls';
import { RichToolBarStyle } from './style';
import { RichToolbarProps } from './types';

export const RichToolbar: FC<RichToolbarProps> = ({ editorState, onChange }) => {
  const toggleBlockType = (blockType: string) => {
    onChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  const toggleInlineStyle = (inlineStyle: string) => {
    onChange(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  return (
    <Stack spacing='2' sx={RichToolBarStyle}>
      <RichBlockControls editorState={editorState} onToggle={toggleBlockType} />
      <InlineControls editorState={editorState} onToggle={toggleInlineStyle} />
      <RichAttachementInput />
    </Stack>
  );
};
