import { annotatorProvider } from '@/providers/annotator-provider';
import { Invoice } from '@bpartners/typescript-client';
import { useMutation } from '@tanstack/react-query';

interface AreaPictureFetcher {
  areaPictureId: string;
  invoice: Invoice;
}

type CrupdateInvoiceFc = (invoice: Invoice) => void;

export const useAreaPictureFetcher = (crupdateInvoice: CrupdateInvoiceFc) => {
  const query = useMutation({
    mutationKey: ['useAreaPictureFetcher'],
    mutationFn: async ({ areaPictureId, invoice }: AreaPictureFetcher) => {
      const data = await annotatorProvider.getAreaPictureById(areaPictureId);

      crupdateInvoice(invoice);

      return data;
    },
  });

  return query;
};
