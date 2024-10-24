import { zodResolver } from '@hookform/resolvers/zod';
import { EditorState } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import { z } from 'zod';
import { FieldErrorMessage, requiredString } from './utils';

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

const invoiceRelaunchValidator = (validators: Record<any, any>) =>
  z.object({
    subject: requiredString(),
    message: z.custom(messageValidator, { message: FieldErrorMessage.required }).transform(transform),
    attachments: z.any(),
    ...validators,
  });

export const invoiceRelaunchResolver = zodResolver(invoiceRelaunchValidator({}));
export const exportLinkMailResolver = zodResolver(
  invoiceRelaunchValidator({
    recipient: z.string().min(1, FieldErrorMessage.required).email({ message: FieldErrorMessage.emailNotValid }),
  })
);
