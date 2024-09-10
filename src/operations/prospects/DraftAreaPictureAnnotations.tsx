import ListComponent from '@/common/components/ListComponent';
import Pagination from '@/common/components/Pagination';
import { DraftAreaPictureAnnotation } from '@bpartners/typescript-client';
import { Box, SxProps } from '@mui/material';
import { Empty, List, useListContext } from 'react-admin';
import { DraftAnnotationItem } from './components';

const DRAFT_ANNOTATION_ITEM_WRAPPER_SX: SxProps = {
  width: '100%',
  display: 'flex',
  alignItems: 'stretch',
  flexWrap: 'wrap',
  justifyContent: {
    sm: 'center',
    lg: 'start',
  },
  gap: 2,
};

export const DraftAreaPictureAnnotations = () => {
  return (
    <List
      component={ListComponent}
      actions={false}
      empty={<Empty resource='prospect avec brouillon' />}
      resource='drafts-annotations'
      pagination={<Pagination />}
    >
      <DraftAreaPictureAnnotationContent />
    </List>
  );
};

const DraftAreaPictureAnnotationContent = () => {
  const { data: draftsAnnotations = [] } = useListContext<Required<DraftAreaPictureAnnotation>>();
  return (
    <Box sx={DRAFT_ANNOTATION_ITEM_WRAPPER_SX}>
      {draftsAnnotations.map(draftAnnotation => {
        return <DraftAnnotationItem key={draftAnnotation.id} draftAnnotation={draftAnnotation} />;
      })}
    </Box>
  );
};
