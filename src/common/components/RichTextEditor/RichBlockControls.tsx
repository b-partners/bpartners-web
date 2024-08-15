import {
  Code as CodeIcon,
  FormatListBulleted as FormatListBulletedIcon,
  FormatListNumbered as FormatListNumberedIcon,
  FormatQuote as FormatQuoteIcon,
} from '@mui/icons-material';
import { ButtonGroup } from '@mui/material';
import { FC } from 'react';
import { RichRenderEditorFunc } from './RichRenderEditorFunc';
import { RichControlsProps } from './types';

// block controls
const BLOCK_TYPES = {
  heading: ['one', 'two', 'three', 'four', 'five'].map((n, index) => ({
    label: 'h1',
    icon: <b>h{index + 1}</b>,
    style: `header-${n}`,
  })),
  rest: [
    { label: 'Blockquote', icon: <FormatQuoteIcon />, style: 'blockquote' },
    { label: 'Code Block', icon: <CodeIcon />, style: 'code-block' },
    { label: 'UL', icon: <FormatListBulletedIcon />, style: 'unordered-list-item' },
    { label: 'OL', icon: <FormatListNumberedIcon />, style: 'ordered-list-item' },
  ],
};

export const RichBlockControls: FC<RichControlsProps> = ({ editorState, onToggle }) => {
  const selection = editorState.getSelection();
  // get the blockType of the block the cursor/selection is currently in
  const blockType = editorState.getCurrentContent().getBlockForKey(selection.getStartKey()).getType();

  const isActive = (style: string) => blockType === style;

  return (
    <>
      <ButtonGroup>
        <RichRenderEditorFunc reg={BLOCK_TYPES['heading']} isActive={isActive} onToggle={onToggle} />
      </ButtonGroup>
      <ButtonGroup>
        <RichRenderEditorFunc reg={BLOCK_TYPES['rest']} isActive={isActive} onToggle={onToggle} />
      </ButtonGroup>
    </>
  );
};
