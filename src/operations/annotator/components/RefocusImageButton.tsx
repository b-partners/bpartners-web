import { BPButton } from '@/common/components/BPButton';
import { useDialog } from '@/common/store/dialog';
import { FC } from 'react';
import { AnnotatorResetStateConfirmationDialog } from '.';
import { RefocusImageButtonProps } from '../types';

export const RefocusImageButton: FC<RefocusImageButtonProps> = ({ onAccept, isLoading, isExtended }) => {
  const { open } = useDialog();

  const handleOpen = () => {
    open(<AnnotatorResetStateConfirmationDialog title="Recentrer l'image" onConfirm={onAccept} content={!isExtended ? 'refocusImage' : 'resetRefocusImage'} />);
  };

  return (
    <BPButton
      type='button'
      onClick={handleOpen}
      data-cy='center-img-btn'
      label={`bp.action.${!isExtended ? 'refocusImage' : 'resetRefocusImage'}`}
      isLoading={isLoading}
    />
  );
};
