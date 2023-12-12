import zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldErrorMessage, requiredString } from './utils';
import { EditorState } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';

const getHTML = (editorState: EditorState) => {
  const content = editorState.getCurrentContent();
  return stateToHTML(content);
};

export const messageValidator = (_editorState: unknown) => {
  const htmlContent = getHTML(_editorState as EditorState);
  if (htmlContent.length === 0) return false;
  return true;
};

const transform = (_editorState: unknown) => getHTML(_editorState as EditorState);

const invoiceRelaunchValidator = zod.object({
  subject: requiredString(),
  message: zod.custom(messageValidator, { message: FieldErrorMessage.required }).transform(transform),
  attachments: zod.any(),
});

export const invoiceRelaunchResolver = zodResolver(invoiceRelaunchValidator);
