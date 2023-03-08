import { Delete as DeleteIcon, Edit as EditIcon, ExpandLess as ExpandLessIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Avatar, Box, CardActions, CardContent, Collapse, Divider, IconButton, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import { BP_COLOR } from 'src/bp-theme';
import { INVOICE_EDITION } from '../style';

const PaymentRegulationItem = props => {
  const { data, onEdit, onRemove, percentValue } = props;
  const { comment, maturityDate } = data;
  const [expandState, setExpandState] = useState(false);

  const handleExpandClick = () => setExpandState(e => !e);

  const haveComment = comment && comment.length > 0;

  const commentCutter = (comment, show = true) => {
    if (comment.length > 23) {
      return { comment: show ? `${comment.slice(0, 23)}...` : 'Commentaire : ', needExpand: true };
    }
    return { comment, needExpand: false };
  };

  if (!percentValue || percentValue === 0) return;

  return (
    <Box sx={INVOICE_EDITION.PR_ITEMS}>
      <Paper elevation={3}>
        <Box
          sx={{
            padding: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ flexBasis: '30%' }}>
            <Avatar sx={{ bgcolor: BP_COLOR[20] }}>
              <Typography fontWeight='800' fontSize='0.9rem' sx={{ position: 'relative', top: 1 }}>
                {percentValue}%
              </Typography>
            </Avatar>
          </Box>
          <Box sx={{ flexBasis: '60%' }}>
            <Typography variant='body2' sx={{ position: 'relative', top: 1 }}>
              À payer avant :
            </Typography>
            <Typography variant='body2' sx={{ position: 'relative', top: 1 }}>
              {maturityDate}
            </Typography>
          </Box>
          <Box sx={{ flexBasis: '15%' }}>
            <IconButton onClick={onRemove}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
        <Divider sx={{ marginBottom: 1 }} />
        <CardActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography>{haveComment ? commentCutter(comment, !expandState).comment : 'Aucun commentaire'}</Typography>
          <Box>
            {haveComment && commentCutter(comment).needExpand && (
              <IconButton onClick={handleExpandClick}>{!expandState ? <ExpandMoreIcon /> : <ExpandLessIcon />}</IconButton>
            )}
            <IconButton onClick={onEdit}>
              <EditIcon />
            </IconButton>
          </Box>
        </CardActions>
        <Collapse in={expandState} sx={{ paddingBottom: 0 }} timeout='auto' unmountOnExit>
          <CardContent sx={{ paddingBottom: 0 }}>
            <Typography paragraph>{comment}</Typography>
          </CardContent>
        </Collapse>
      </Paper>
    </Box>
  );
};

export default PaymentRegulationItem;
