import { CustomPage } from '@bpartners/typescript-client';
import { v4 } from 'uuid';

export const SECTION_PRIORITIES = ['IMPORTANT', 'MEDIUM', 'SMALL'] as const;
export type SectionPriority = (typeof SECTION_PRIORITIES)[number];

export const LEAF_SECTION_TYPES = ['TEXT', 'IMAGE', 'TABLE'] as const;
export const SECTION_TYPES = [...LEAF_SECTION_TYPES, 'SPLIT_SECTION', 'THREE_SPLIT_SECTION'] as const;

export interface TextSectionDraft {
  type: 'TEXT';
  priority: SectionPriority;
  text: string;
}

export interface ImageSectionDraft {
  type: 'IMAGE';
  priority: SectionPriority;
  url: string;
  caption: string;
}

export interface TableDataDraft {
  headers: string[];
  rows: string[][];
}

export interface TableSectionDraft {
  type: 'TABLE';
  priority: SectionPriority;
  tableData: TableDataDraft;
}

export type LeafSectionDraft = TextSectionDraft | ImageSectionDraft | TableSectionDraft;
export type LeafSectionType = LeafSectionDraft['type'];

export interface SplitSectionDraft {
  type: 'SPLIT_SECTION';
  priority: SectionPriority;
  leftSection: LeafSectionDraft;
  rightSection: LeafSectionDraft;
}

export interface ThreeSplitSectionDraft {
  type: 'THREE_SPLIT_SECTION';
  priority: SectionPriority;
  leftSection: LeafSectionDraft;
  middleSection: LeafSectionDraft;
  rightSection: LeafSectionDraft;
}

export type SectionDraft = LeafSectionDraft | SplitSectionDraft | ThreeSplitSectionDraft;
export type SectionType = SectionDraft['type'];

export interface CustomPageDraft {
  id: string;
  pageTitle: string;
  sections: SectionDraft[];
}

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  TEXT: 'Texte',
  IMAGE: 'Image',
  TABLE: 'Tableau',
  SPLIT_SECTION: 'Deux colonnes',
  THREE_SPLIT_SECTION: 'Trois colonnes',
};

export const SECTION_PRIORITY_LABELS: Record<SectionPriority, string> = {
  IMPORTANT: 'Important',
  MEDIUM: 'Moyen',
  SMALL: 'Discret',
};

export const createLeafSection = (type: LeafSectionType): LeafSectionDraft => {
  if (type === 'IMAGE') return { type, priority: 'MEDIUM', url: '', caption: '' };
  if (type === 'TABLE') return { type, priority: 'MEDIUM', tableData: { headers: ['', ''], rows: [['', '']] } };
  return { type, priority: 'MEDIUM', text: '' };
};

export const createSection = (type: SectionType): SectionDraft => {
  if (type === 'SPLIT_SECTION') return { type, priority: 'MEDIUM', leftSection: createLeafSection('TEXT'), rightSection: createLeafSection('TEXT') };
  if (type === 'THREE_SPLIT_SECTION') {
    return {
      type,
      priority: 'MEDIUM',
      leftSection: createLeafSection('TEXT'),
      middleSection: createLeafSection('TEXT'),
      rightSection: createLeafSection('TEXT'),
    };
  }
  return createLeafSection(type);
};

export const createCustomPage = (): CustomPageDraft => ({ id: v4(), pageTitle: '', sections: [] });

const isLeafSectionValid = (section: LeafSectionDraft): boolean => {
  if (section.type === 'TEXT') return section.text.trim().length > 0;
  if (section.type === 'IMAGE') return section.url.trim().length > 0;
  return section.tableData.headers.some(header => header.trim().length > 0);
};

export const isSectionValid = (section: SectionDraft): boolean => {
  if (section.type === 'SPLIT_SECTION') return isLeafSectionValid(section.leftSection) && isLeafSectionValid(section.rightSection);
  if (section.type === 'THREE_SPLIT_SECTION') {
    return isLeafSectionValid(section.leftSection) && isLeafSectionValid(section.middleSection) && isLeafSectionValid(section.rightSection);
  }
  return isLeafSectionValid(section);
};

export const isCustomPageValid = ({ pageTitle, sections }: CustomPageDraft): boolean =>
  pageTitle.trim().length > 0 && sections.length > 0 && sections.every(isSectionValid);

export const toCustomPage = ({ pageTitle, sections }: CustomPageDraft): CustomPage => ({ pageTitle: pageTitle.trim(), sections });
