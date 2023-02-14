import { Clear as ClearIcon } from '@mui/icons-material';
import { Card, CardContent, CardHeader, IconButton, Toolbar } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useRedirect } from 'react-admin';

const useStyle = makeStyles(() => ({
  card: { border: 'none !important' },
}));

const BPFormLayout = props => {
  const { children, resource, title } = props;
  const classes = useStyle();
  return (
    <Card className={classes.card}>
      <CardHeader title={title} action={<CloseButton resource={resource} />} />
      <CardContent>{children}</CardContent>
    </Card>
  );
};

const CloseButton = props => {
  const { resource } = props;
  const redirect = useRedirect();

  const toList = () => {
    redirect('list', resource);
  };

  return (
    <Toolbar sx={{ display: 'flex', justifyContent: 'end' }}>
      <IconButton onClick={toList}>
        <ClearIcon data-testid='closeIcon' />
      </IconButton>
    </Toolbar>
  );
};

export default BPFormLayout;
