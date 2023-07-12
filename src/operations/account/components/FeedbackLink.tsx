import { CopyAll as CopyIcon } from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';
import { useNotify } from 'react-admin';
import { FEEDBACK_LINK_TEXT, FEEDBACK_LINK_TEXT_CONTAINER } from '../style';

interface FeedbackLinkProps {
  link?: string;
}

export const FeedbackLink = ({ link = 'Non spécifié' }: FeedbackLinkProps) => {
  const notify = useNotify();
  const handleClick = () => {
    navigator.clipboard.writeText(link);
    notify('Le texte a été copié avec succès !', { type: 'success' });
  };
  return (
    <Box sx={FEEDBACK_LINK_TEXT_CONTAINER}>
      <Box sx={FEEDBACK_LINK_TEXT}>
        <Typography variant='body2' sx={{ wordBreak: 'keep-all', width: 'max-content' }}>
          {link}
        </Typography>
      </Box>
      <Box>
        <IconButton
          data-testId='copy-link-button-id'
          disabled={link === 'Non spécifié'}
          sx={{ borderRadius: 'none', ml: 1 }}
          onClick={handleClick}
          size='small'
        >
          <CopyIcon />
        </IconButton>
      </Box>
    </Box>
  );
};
