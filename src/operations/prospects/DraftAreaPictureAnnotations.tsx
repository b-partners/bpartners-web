import { BPButton } from '@/common/components';
import ListComponent from '@/common/components/ListComponent';
import Pagination from '@/common/components/Pagination';
import { getFileUrl } from '@/common/utils';
import { DraftAreaPictureAnnotation, FileType, ZoomLevel } from '@bpartners/typescript-client';
import { Datagrid, FunctionField, List, TextField } from 'react-admin';
import { useNavigate } from 'react-router';

export const DraftAreaPictureAnnotations = () => {
  const navigate = useNavigate();

  const navigateToAnnotation = (draftsAnnotations: DraftAreaPictureAnnotation) => {
    const { fileId, prospectId, id: pictureId } = draftsAnnotations.areaPicture;
    const fileUrl = getFileUrl(fileId, FileType.AREA_PICTURE);
    navigate(
      `/annotator?imgUrl=${encodeURIComponent(fileUrl)}&zoomLevel=${ZoomLevel.HOUSES_0}&pictureId=${pictureId}&prospectId=${prospectId}&fileId=${fileId}`
    );
  };

  return (
    <List empty={false} actions={false} resource='drafts-annotations' pagination={<Pagination />}>
      <ListComponent>
        <Datagrid bulkActionButtons={false}>
          <TextField source='areaPicture.address' label='Adresse' />
          <FunctionField render={arePictureDetail => <BPButton label='Terminer' onClick={() => navigateToAnnotation(arePictureDetail)} />} />
        </Datagrid>
      </ListComponent>
    </List>
  );
};
