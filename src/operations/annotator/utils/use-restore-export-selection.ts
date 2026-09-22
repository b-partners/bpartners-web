import { useAnnotatorComponentStore } from '@/common/store';
import { ExportAreaPictureAnnotationConf } from '@bpartners/typescript-client';
import { useEffect } from 'react';
import type { CustomPageDraft } from '../components/export-pdf-conf-dialog/custom-page-editor/types';

export const useRestoreExportSelection = (properties?: Record<string, unknown>) => {
  const setExportPdfConf = useAnnotatorComponentStore(state => state.setExportPdfConf);
  const setExportCustomPages = useAnnotatorComponentStore(state => state.setExportCustomPages);

  const exportPdfConf = properties?.exportPdfConf as ExportAreaPictureAnnotationConf | undefined;
  const exportCustomPages = properties?.exportCustomPages as CustomPageDraft[] | undefined;

  useEffect(() => {
    if (exportPdfConf) setExportPdfConf(exportPdfConf);
    if (exportCustomPages) setExportCustomPages(exportCustomPages);
  }, [exportPdfConf, exportCustomPages, setExportPdfConf, setExportCustomPages]);
};
