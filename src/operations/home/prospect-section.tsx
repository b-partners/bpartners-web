import { CircularProgress, List, ListItem, ListItemText } from '@mui/material';
import { useGetList } from 'react-admin';
import { prospect_section_style } from './styles';

export const ProspectSection = () => {
  const { data = [], isLoading } = useGetList('prospects', { pagination: { page: 1, perPage: 4 } });

  return (
    <>
      <List sx={prospect_section_style}>
        {!isLoading &&
          data.map(({ id, name, address }) => (
            <ListItem key={id}>
              <ListItemText primary={name} secondary={address} />
            </ListItem>
          ))}
      </List>
      {isLoading && <CircularProgress />}
    </>
  );
};
