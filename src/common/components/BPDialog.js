import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const BPDialog = props => {
  const { title, content, btnLabel, handleClick, open = false, onClose = false, closeBtnLabel = false } = props;

  return (
    <div>
      <Dialog open={open} onClose={onClose} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description'>
        <DialogTitle id='alert-dialog-title'>{title}</DialogTitle>
        <DialogContent>
          {content.map((text, index) => (
            <DialogContentText id={`text_${index}`}>{text}</DialogContentText>
          ))}
        </DialogContent>
        <DialogActions>
          {closeBtnLabel && (
            <Button onClick={onClose} autoFocus>
              {closeBtnLabel}
            </Button>
          )}
          <Button onClick={handleClick} autoFocus data-testid='dialog-btn'>
            {btnLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BPDialog;
