import { EditorState } from 'draft-js';
import { CSSProperties, ReactNode } from 'react';

export interface RichToolbarButtonProps {
  onToggle: (style: CSSProperties) => void;
  label: string;
  active: boolean;
  style: CSSProperties;
  children: ReactNode;
}

export interface RichToolbarProps {
  editorState: EditorState;
  onChange: (state: EditorState) => void;
}

export interface RichControlsProps {
  editorState: EditorState;
  onToggle: (style: string) => void;
}

export interface RichTextEditorProps {
  placeholder?: string;
  name: string;
  setAttachement?: (attachements: any) => void;
}

export interface RichTextFormProps {
  attachments: boolean;
}
