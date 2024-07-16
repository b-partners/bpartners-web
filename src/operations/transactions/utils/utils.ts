import { formatDate } from '@/common/utils';
import { getCached } from '@/providers';
import { ContentState, convertFromHTML, EditorState } from 'draft-js';

type DataGenerateLinkFrom = {
  from: Date;
  to: Date;
  downloadLink: string;
};

export const getExportLinkMailDefaultMessage = (dataForm: DataGenerateLinkFrom) => {
  const { companyInfo, name: companyName } = getCached.accountHolder() || { companyInfo: { phone: '' } };
  const { phone } = companyInfo || {};
  const user = getCached.user() || {};
  const message = `<p>Bonjour,<br/><br/>
Vous trouverez ci-dessous l'ensemble des transactions ainsi que les pièces justificatives sur la période du ${formatDate(dataForm.from)} au ${formatDate(
    dataForm.to
  )}<br/><br/><a href="${dataForm.downloadLink}"><strong>Télécharger ici</strong></a><br/><br/>
Bien à vous,<br/><br/>
${companyName}<br/>
${user?.firstName}
${user?.lastName}<br/>
${phone}</p>`;
  const blocksFromHtml = convertFromHTML(message);

  const defaultContentState = ContentState.createFromBlockArray(blocksFromHtml.contentBlocks, blocksFromHtml.entityMap);

  return EditorState.createWithContent(defaultContentState);
};

export const getExportLinkMailSubject = (dataForm: DataGenerateLinkFrom) => {
  const user = getCached.user() || {};
  return `[${user?.firstName} ${user?.lastName}] - Relevé comptable & justificatifs [${formatDate(dataForm.from)} - ${formatDate(dataForm.to)}]`;
};
