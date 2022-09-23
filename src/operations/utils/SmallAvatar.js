
import { Avatar, styled } from '@mui/material';

export const SmallAvatar = styled(Avatar)(({ theme }) => ({
    width: 21,
    height: 21,
    border: `2px solid ${theme.palette.background.paper}`,
    color: "gray",
    backgroundColor: "white"
}));