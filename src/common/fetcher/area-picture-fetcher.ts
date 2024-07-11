import { UrlParams } from '@bpartners/annotator-component';
import { FileType, Invoice } from '@bpartners/typescript-client';
import { useMutation } from 'react-query';
import { annotatorProvider } from '@/providers/annotator-provider';
import { getFileUrl } from '../utils';

interface AreaPictureFetcher {
  areaPictureId: string;
  invoice: Invoice;
}

interface CrupdateInvoiceFc {
  (invoice: Invoice): void;
}

export const useAreaPictureFetcher = (crupdateInvoice: CrupdateInvoiceFc) => {
  const query = useMutation({
    mutationKey: ['useAreaPictureFetcher'],
    mutationFn: async ({ areaPictureId, invoice }: AreaPictureFetcher) => {
      const data = await annotatorProvider.getAreaPictureById(areaPictureId);
      const fileUrl = getFileUrl(data.fileId, FileType.AREA_PICTURE);

      crupdateInvoice(invoice);

      UrlParams.set('imgUrl', fileUrl);
      UrlParams.set('pictureId', data.id);
      UrlParams.set('prospectId', data.prospectId);
      UrlParams.set('fileId', data.fileId);

      return data;
    },
  });

  return query;
};
