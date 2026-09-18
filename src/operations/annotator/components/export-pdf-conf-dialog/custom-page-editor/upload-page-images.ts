import { getFileUrl } from '@/common/utils';
import { FileApi, getCached } from '@/providers';
import { FileType } from '@bpartners/typescript-client';
import { v4 } from 'uuid';
import { CustomPageDraft, LeafSectionDraft, SectionDraft } from './types';

const isRemoteUrl = (url: string) => /^https?:\/\//i.test(url);

const toFile = async (url: string, fileId: string): Promise<File> => {
  if (url.startsWith('data:')) {
    const [meta, data] = url.split(',');
    const mimeType = meta.match(/:(.*?);/)?.[1] || 'image/png';
    const bytes = Uint8Array.from(atob(data), char => char.charCodeAt(0));
    return new File([bytes], `${fileId}.${mimeType.split('/')[1] || 'png'}`, { type: mimeType });
  }

  const response = await fetch(url);
  const blob = await response.blob();
  const mimeType = blob.type || 'image/png';
  return new File([blob], `${fileId}.${mimeType.split('/')[1] || 'png'}`, { type: mimeType });
};

const uploadImage = async (url: string, accountId: string) => {
  const fileId = `custom-page-${v4()}`;
  const file = await toFile(url, fileId);
  await FileApi().uploadFile(accountId, fileId, file, FileType.AREA_PICTURE, { headers: { 'Content-Type': file.type || 'image/png' } });
  return fileId;
};

const uploadLeafImages = async (section: LeafSectionDraft, accountId: string): Promise<LeafSectionDraft> => {
  if (section.type !== 'IMAGE' || !section.url || section.fileId) return section;
  if (isRemoteUrl(section.url)) return section;

  const fileId = await uploadImage(section.url, accountId);
  return { ...section, fileId, url: getFileUrl(fileId, FileType.AREA_PICTURE) };
};

const uploadSectionImages = async (section: SectionDraft, accountId: string): Promise<SectionDraft> => {
  if (section.type === 'SPLIT_SECTION') {
    const [leftSection, rightSection] = await Promise.all([
      uploadLeafImages(section.leftSection, accountId),
      uploadLeafImages(section.rightSection, accountId),
    ]);
    return { ...section, leftSection, rightSection };
  }

  if (section.type === 'THREE_SPLIT_SECTION') {
    const [leftSection, middleSection, rightSection] = await Promise.all([
      uploadLeafImages(section.leftSection, accountId),
      uploadLeafImages(section.middleSection, accountId),
      uploadLeafImages(section.rightSection, accountId),
    ]);
    return { ...section, leftSection, middleSection, rightSection };
  }

  return uploadLeafImages(section, accountId);
};

export const uploadPageImages = async (page: CustomPageDraft): Promise<CustomPageDraft> => {
  const { accountId } = getCached.userInfo();
  if (!accountId) return page;

  const sections = await Promise.all(page.sections.map(section => uploadSectionImages(section, accountId)));
  return { ...page, sections };
};
