import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const BPDialog = props => {
  const { title, content, btnLabel, handleClick, open = false, onClose = () => {}, closeBtnLabel = true } = props;

  return (
    <div>
      <Dialog open={open} onClose={onClose} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description'>
        <DialogTitle id='alert-dialog-title'>{title}</DialogTitle>
        <DialogContent>
          {content.map((text, index) => (
            <DialogContentText key={`${title}_text_key_${index}`} id={`text_${index}`}>
              {text}
            </DialogContentText>
          ))}
        </DialogContent>
        <DialogActions>
          {closeBtnLabel && <Button onClick={onClose}>Plus tard</Button>}
          <Button onClick={handleClick} data-testid='dialog-btn'>
            {btnLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BPDialog;
