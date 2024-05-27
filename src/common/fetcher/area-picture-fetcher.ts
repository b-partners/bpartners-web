import { UrlParams } from '@bpartners/annotator-component';
import { Invoice } from '@bpartners/typescript-client';
import { useMutation } from 'react-query';
import { annotatorProvider } from 'src/providers/annotator-provider';

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

      console.log('here 2');

      crupdateInvoice(invoice);

      UrlParams.set('pictureId', data.id);
      UrlParams.set('prospectId', data.prospectId);
      UrlParams.set('fileId', data.fileId);

      return data;
    },
  });

  return query;
};
