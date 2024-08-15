import { stringCutter } from '@/common/utils';
import { MAX_ATTACHMENT_NAME_LENGTH } from '@/operations/invoice/utils';
import { ExpandMore as ExpandMoreIcon, InsertDriveFile as InsertDriveFileIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Badge, Chip, Typography } from '@mui/material';
import { List } from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';
import { RichAttachementAccordionStyle } from './style';

export const AttachmentForm = () => {
  const { setValue } = useFormContext();
  const { attachments } = useWatch();

  const handleDeleteAttachment = (idx: number) => {
    const localVarAttachments = attachments.slice();
    localVarAttachments.splice(idx, 1);
    setValue('attachments', localVarAttachments);
  };

  return (
    <Accordion sx={RichAttachementAccordionStyle} defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant='subtitle1'>Pieces jointes</Typography>
        <Badge badgeContent={`${attachments?.length || 0}`}>
          <InsertDriveFileIcon />
        </Badge>
      </AccordionSummary>
      <AccordionDetails sx={{ py: 0 }}>
        <List>
          {attachments.map((attachment: any, idx: number) => {
            const { name: filename } = attachment;
            const truncatedName = stringCutter(filename, MAX_ATTACHMENT_NAME_LENGTH);
            return <Chip key={truncatedName} label={truncatedName} onDelete={() => handleDeleteAttachment(idx)} />;
          })}

          {attachments.length === 0 && (
            <Typography p={2} variant='subtitle2' sx={{ color: 'grey !important' }}>
              Aucun attachement.
            </Typography>
          )}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};
