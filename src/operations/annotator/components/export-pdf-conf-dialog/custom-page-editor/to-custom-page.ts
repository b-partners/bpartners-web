import { getFileUrl } from '@/common/utils';
import { CustomPage, FileType } from '@bpartners/typescript-client';
import { CustomPageDraft, LeafSectionDraft, SectionDraft } from './types';

const toLeafSection = (section: LeafSectionDraft): LeafSectionDraft => {
  if (section.type !== 'IMAGE') return section;

  const { fileId, ...rest } = section;
  return fileId ? { ...rest, url: getFileUrl(fileId, FileType.AREA_PICTURE) } : rest;
};

const toSection = (section: SectionDraft): SectionDraft => {
  if (section.type === 'SPLIT_SECTION') {
    return { ...section, leftSection: toLeafSection(section.leftSection), rightSection: toLeafSection(section.rightSection) };
  }

  if (section.type === 'THREE_SPLIT_SECTION') {
    return {
      ...section,
      leftSection: toLeafSection(section.leftSection),
      middleSection: toLeafSection(section.middleSection),
      rightSection: toLeafSection(section.rightSection),
    };
  }

  return toLeafSection(section);
};

export const toCustomPage = ({ pageTitle, sections }: CustomPageDraft): CustomPage => ({ pageTitle: pageTitle.trim(), sections: sections.map(toSection) });
