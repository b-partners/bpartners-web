import ListComponent from '@/common/components/ListComponent';
import Pagination from '@/common/components/Pagination';
import { useDraftAnnotationFilterStore } from '@/common/store';
import { DraftAreaPictureAnnotation } from '@bpartners/typescript-client';
import { Box, SxProps } from '@mui/material';
import { Empty, List, useListContext } from 'react-admin';
import { DraftAnnotationFilterBar, DraftAnnotationItem } from './components';

const DRAFT_ANNOTATION_ITEM_WRAPPER_SX: SxProps = {
  '.draft-annotation-list': {
    display: 'grid',
    gridTemplateColumns: { lg: '32% 32% 32%', xs: '45% 45%' },
    justifyContent: 'center',
    gap: '10px 10px',
  },
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
};

export const DraftAreaPictureAnnotations = () => {
  const filters = useDraftAnnotationFilterStore(state => state.filters);
  return (
    <>
      <DraftAnnotationFilterBar />
      <List
        component={ListComponent}
        actions={false}
        empty={<Empty resource='prospect avec brouillon' />}
        resource='drafts-annotations'
        pagination={<Pagination />}
        filter={filters}
        queryOptions={{
          refetchOnWindowFocus: false,
        }}
      >
        <DraftAreaPictureAnnotationContent />
      </List>
    </>
  );
};

const DraftAreaPictureAnnotationContent = () => {
  const { data: draftsAnnotations = [] } = useListContext<Required<DraftAreaPictureAnnotation>>();
  return (
    <Box sx={DRAFT_ANNOTATION_ITEM_WRAPPER_SX}>
      <Box className='draft-annotation-list'>
        {draftsAnnotations.map(draftAnnotation => {
          return <DraftAnnotationItem key={draftAnnotation.id} draftAnnotation={draftAnnotation} />;
        })}
      </Box>
    </Box>
  );
};
