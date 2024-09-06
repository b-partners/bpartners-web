import ListComponent from '@/common/components/ListComponent';
import Pagination from '@/common/components/Pagination';
import { DraftAreaPictureAnnotation, Prospect } from '@bpartners/typescript-client';
import { Box, LinearProgress, SxProps } from '@mui/material';
import { useMemo } from 'react';
import { Empty, List, useGetList, useListContext } from 'react-admin';
import { DraftAnnotationItem, DraftAnnotationItemProps } from './components';

const DRAFT_ANNOTATION_ITEM_WRAPPER_SX: SxProps = {
  width: '100%',
  display: 'flex',
  alignItems: 'stretch',
  justifyContent: 'start',
  gap: 2,
};

export const DraftAreaPictureAnnotations = () => {
  const { data: prospets, isLoading: isFetchingProspects } = useGetList('prospects');

  if (isFetchingProspects) {
    return <LinearProgress color='primary' />;
  }

  return (
    <List
      component={ListComponent}
      actions={false}
      empty={<Empty resource='prospect avec brouillon' />}
      resource='drafts-annotations'
      pagination={<Pagination />}
    >
      <DraftAreaPictureAnnotationContent prospets={prospets} />
    </List>
  );
};

const DraftAreaPictureAnnotationContent = ({ prospets }: { prospets: Prospect[] }) => {
  const { data: draftsAnnotations = [], page, perPage } = useListContext<Required<DraftAreaPictureAnnotation>>();

  const mappedDraftAnnotations: DraftAnnotationItemProps['mappedAnnotation'][] = useMemo(() => {
    return draftsAnnotations.map(annotation => {
      return {
        draftAnnotation: annotation,
        prospect: prospets.find(prospect => prospect.id === annotation.areaPicture.prospectId),
      };
    });
  }, [prospets, draftsAnnotations, page, perPage]);

  return (
    <Box sx={DRAFT_ANNOTATION_ITEM_WRAPPER_SX}>
      {mappedDraftAnnotations.map(mappedAnnotation => {
        return <DraftAnnotationItem key={mappedAnnotation.draftAnnotation.id} mappedAnnotation={mappedAnnotation} />;
      })}
    </Box>
  );
};
