import { Box, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import HandshakeIcon from '@mui/icons-material/Handshake';
import SettingsIcon from '@mui/icons-material/Settings';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export const NavBar = () => {
    return(
        <Box display="flex" alignItems="center" justifyContent="space-between" px={2} py={1}>
      <Box display="flex" alignItems="center" gap={1}>
        <img src="/b-logo.png" alt="Birdia logo" width={40} height={40} />
        <Box fontWeight="bold" fontSize="1.5rem">BIRDIA</Box>
      </Box>

      {/* Navigation icons */}
      <Box
        display="flex"
        alignItems="center"
        gap={2.5}
        px={3}
        py={1}
        borderRadius={6}
        boxShadow={'0px 4px 12px rgba(0, 0, 0, 0.1)'}
        bgcolor="#fff"
      >
        <IconButton><SearchIcon /></IconButton>
        <Box width={1} height={24} bgcolor="#E0E0E0" mx={1} />

        <IconButton sx={{ borderBottom: '3px solid #ff5722', borderRadius: 0 }}>
          <HomeIcon />
        </IconButton>
        <IconButton><CalendarMonthIcon /></IconButton>
        <IconButton><CreditCardIcon /></IconButton>
        <IconButton><HandshakeIcon /></IconButton>

        <Box width={1} height={24} bgcolor="#E0E0E0" mx={1} />

        <IconButton><SettingsIcon /></IconButton>
        <IconButton><PowerSettingsNewIcon /></IconButton>
      </Box>

      {/* Profile icon */}
      <Box
        width={48}
        height={48}
        borderRadius="50%"
        boxShadow={'0px 4px 12px rgba(0, 0, 0, 0.1)'}
        bgcolor="#fff"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <AccountCircleIcon fontSize="large" />
      </Box>
    </Box>
    )
};