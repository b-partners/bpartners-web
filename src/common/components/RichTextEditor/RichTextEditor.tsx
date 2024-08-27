/* eslint-disable react-hooks/exhaustive-deps */
import { Editor, EditorState, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { RichToolbar } from './RichToolbar';
import { RichTextEditorStyleMap } from './style';
import { RichTextEditorProps } from './types';

export const RichTextEditor: FC<RichTextEditorProps> = ({ placeholder, name }) => {
  const { setValue, clearErrors } = useFormContext();
  const editorState = useWatch({ name });
  const handleChange = (state: EditorState) => setValue(name, state);
  const handleFocus = () => clearErrors(name);

  const handleKeyCommand = (cmd: string) => {
    const newState = RichUtils.handleKeyCommand(editorState, cmd);
    if (newState) {
      handleChange(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  return (
    <>
      <RichToolbar editorState={editorState} onChange={handleChange} />
      <Editor
        onChange={handleChange}
        onFocus={handleFocus}
        customStyleMap={RichTextEditorStyleMap}
        editorState={editorState}
        handleKeyCommand={handleKeyCommand}
        placeholder={placeholder || ''}
      />
    </>
  );
};
