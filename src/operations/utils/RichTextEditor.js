import { Code, FormatBold, FormatItalic, FormatListBulleted, FormatListNumbered, FormatQuote, FormatStrikethrough } from '@mui/icons-material';
import { ButtonGroup, Divider, IconButton, Stack } from '@mui/material';
import { Editor, EditorState, RichUtils } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import 'draft-js/dist/Draft.css';
import React, { useCallback, useEffect, useState } from 'react';

// custom styleMap
const styleMap = {
  STRIKETHROUGH: {
    textDecoration: 'line-through',
  },
};

// main component
const RichTextEditor = ({ setContent, placeholder = '' }) => {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  useEffect(() => {
    const htmlContent = stateToHTML(editorState.getCurrentContent());
    setContent(htmlContent);
  }, [editorState, setContent]);

  const handleKeyCommand = cmd => {
    const newState = RichUtils.handleKeyCommand(editorState, cmd);

    if (newState) {
      setEditorState(newState);
      return true;
    }

    return false;
  };

  return (
    <>
      <Toolbar editorState={editorState} onChange={setEditorState} />
      <Editor onChange={setEditorState} customStyleMap={styleMap} editorState={editorState} handleKeyCommand={handleKeyCommand} placeholder={placeholder} />
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
      divider={<Divider />}
      p={1}
      boxShadow='rgba(27, 31, 35, 0.04) 0 1px 0 0'
      position='sticky'
      top={0}
      zIndex={999}
      bgcolor='white'
    >
      <BlockControls editorState={editorState} onToggle={toggleBlockType} />
      <InlineControls editorState={editorState} onToggle={toggleInlineStyle} />
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
    <IconButton size='small' onClick={_onToggle} title={label} sx={{ minWidth: '2rem', borderRadius: '0.5rem', ...getStyle() }}>
      {children}
    </IconButton>
  );
};

const RenderEditorFunc = ({ reg = [], onToggle, isActive }) => {
  const renderAll = useCallback(
    () =>
      reg.map(type => (
        <ToolbarButton key={type.label} active={isActive(type.style)} onToggle={onToggle} label={type.label} style={type.style}>
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
