/* eslint-disable react-hooks/exhaustive-deps */
import { Code, FormatBold, FormatItalic, FormatListBulleted, FormatListNumbered, FormatQuote, FormatStrikethrough } from '@mui/icons-material';
import { ButtonGroup, IconButton, Stack } from '@mui/material';
import { Editor, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { useCallback } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { RichAttachementInput } from './RichAttachementInput';

// custom styleMap
const styleMap = {
  STRIKETHROUGH: {
    textDecoration: 'line-through',
  },
};

// main component
const RichTextEditor = ({ placeholder = '', name, setAttachement }) => {
  const { setValue, clearErrors } = useFormContext();
  const editorState = useWatch({ name });
  const handleChange = state => (typeof state === 'function' ? setValue(name, state(editorState)) : setValue(name, state));
  const handleFocus = () => clearErrors(name);

  const handleKeyCommand = cmd => {
    const newState = RichUtils.handleKeyCommand(editorState, cmd);

    if (newState) {
      handleChange(newState);
      return true;
    }

    return false;
  };

  return (
    <>
      <Toolbar editorState={editorState} onChange={handleChange} />
      <Editor
        onChange={handleChange}
        onFocus={handleFocus}
        customStyleMap={styleMap}
        editorState={editorState}
        handleKeyCommand={handleKeyCommand}
        placeholder={placeholder}
      />
    </>
  );
};

// toolbar component
const Toolbar = ({ editorState, onChange }) => {
  const toggleBlockType = blockType => {
    onChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  const toggleInlineStyle = inlineStyle => {
    onChange(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  return (
    <Stack
      spacing='2'
      flexDirection='row'
      justifyContent='flex-end'
      p={1}
      boxShadow='rgba(27, 31, 35, 0.04) 0 1px 0 0'
      marginBottom={2}
      position='sticky'
      top='0'
      bgcolor='white'
      zIndex='10'
    >
      <BlockControls editorState={editorState} onToggle={toggleBlockType} />
      <InlineControls editorState={editorState} onToggle={toggleInlineStyle} />
      <RichAttachementInput />
    </Stack>
  );
};

// utils: Button
const ToolbarButton = ({ onToggle, label, active, style, children }) => {
  const _onToggle = e => {
    e.preventDefault();
    onToggle(style);
  };

  const getStyle = () => {
    let localVarStyle = {};
    active && (localVarStyle['backgroundColor'] = '#E7E7E7');
    return localVarStyle;
  };

  return (
    <IconButton size='small' data-testid={label} onClick={_onToggle} title={label} sx={{ minWidth: '2rem', borderRadius: '0.5rem', ...getStyle() }}>
      {children}
    </IconButton>
  );
};

const RenderEditorFunc = ({ reg = [], onToggle, isActive }) => {
  const renderAll = useCallback(
    () =>
      reg.map((type, k) => (
        <ToolbarButton key={type.label + k} active={isActive(type.style)} onToggle={onToggle} label={type.label} style={type.style}>
          {type.icon}
        </ToolbarButton>
      )),
    [isActive, onToggle, reg]
  );

  return renderAll();
};

// inline controls
const INLINE_TYPES = [
  { label: 'Bold', icon: <FormatBold />, style: 'BOLD' },
  { label: 'Italic', icon: <FormatItalic />, style: 'ITALIC' },
  { label: 'Strikethrough', icon: <FormatStrikethrough />, style: 'STRIKETHROUGH' },
];

const InlineControls = ({ editorState, onToggle }) => {
  let currentStyle = editorState.getCurrentInlineStyle();

  const isActive = style => currentStyle.has(style);

  return (
    <ButtonGroup>
      <RenderEditorFunc reg={INLINE_TYPES} isActive={isActive} onToggle={onToggle} />
    </ButtonGroup>
  );
};

// block controls
const BLOCK_TYPES = {
  heading: ['one', 'two', 'three', 'four', 'five'].map((n, index) => ({
    label: 'h1',
    icon: <b>h{index + 1}</b>,
    style: `header-${n}`,
  })),
  rest: [
    { label: 'Blockquote', icon: <FormatQuote />, style: 'blockquote' },
    { label: 'Code Block', icon: <Code />, style: 'code-block' },
    { label: 'UL', icon: <FormatListBulleted />, style: 'unordered-list-item' },
    { label: 'OL', icon: <FormatListNumbered />, style: 'ordered-list-item' },
  ],
};

const BlockControls = ({ editorState, onToggle }) => {
  const selection = editorState.getSelection();
  // get the blockType of the block the cursor/selection is currently in
  const blockType = editorState.getCurrentContent().getBlockForKey(selection.getStartKey()).getType();

  const isActive = style => blockType === style;

  return (
    <>
      <ButtonGroup>
        <RenderEditorFunc reg={BLOCK_TYPES['heading']} isActive={isActive} onToggle={onToggle} />
      </ButtonGroup>

      <ButtonGroup>
        <RenderEditorFunc reg={BLOCK_TYPES['rest']} isActive={isActive} onToggle={onToggle} />
      </ButtonGroup>
    </>
  );
};

export default RichTextEditor;
