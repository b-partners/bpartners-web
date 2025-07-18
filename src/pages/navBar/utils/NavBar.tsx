import { PALETTE_COLORS } from '@/common/config/theme';
import { NavBarStyle } from '../components/style';
import {
  AccountCircle as AccountCircleIcon,
  CalendarMonth as CalendarMonthIcon,
  Close as CloseIcon,
  CreditScore as CreditScoreIcon,
  Handshake as HandshakeIcon,
  Home as HomeIcon,
  PowerSettingsNew as PowerSettingsNewIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { Box, IconButton, InputBase } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchText, setSearchText] = useState('');
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const currentPath = location.pathname;
  const isProfilePage = currentPath === '/newprofils';

  const navLinks = [
    { icon: <HomeIcon sx={{ width: 36, height: 36 }} />, path: '/homepage' },
    { icon: <CalendarMonthIcon sx={{ width: 36, height: 36 }} />, path: '/calendar-sync' },
    { icon: <CreditScoreIcon sx={{ width: 36, height: 36 }} />, path: '/bank' },
    { icon: <HandshakeIcon sx={{ width: 36, height: 36 }} />, path: '/partners' },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isSearchActive && searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        closeSearch();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchActive]);

  const openSearch = () => {
    setIsSearchActive(true);
    setHoveredItem('search');
  };

  const closeSearch = () => {
    setIsSearchActive(false);
    setSearchText('');
    setHoveredItem(null);
  };

  return (
    <Box component='nav' className='navbar' sx={NavBarStyle}>
      <Box className='navbar-logo'>
        <img src='/b-logo.png' alt='Birdia logo' width={40} height={40} />
        <Box>BIRDIA</Box>
      </Box>

      <Box className='navbar-center-box'>
        <Box display={isSearchActive ? 'none' : 'flex'} alignItems='center' gap={2} width='100%' justifyContent='center'>
          <IconButton
            onClick={openSearch}
            onMouseEnter={() => setHoveredItem('search')}
            onMouseLeave={() => setHoveredItem(null)}
            disableRipple
            className={`navbar-icon-button ${hoveredItem === 'search' ? 'navbar-icon-active' : ''}`}
          >
            <SearchIcon sx={{ width: 36, height: 36 }} />
          </IconButton>

          <Box className='navbar-divider' />

          {navLinks.map(({ icon, path }, index) => (
            <IconButton
              key={index}
              onClick={() => navigate(path)}
              onMouseEnter={() => setHoveredItem(path)}
              onMouseLeave={() => setHoveredItem(null)}
              disableRipple
              className={`navbar-icon-button ${hoveredItem === path || currentPath === path ? 'navbar-icon-active' : ''}`}
            >
              {React.cloneElement(icon, { color: PALETTE_COLORS.black })}
            </IconButton>
          ))}

          <Box className='navbar-divider' />

          <IconButton
            onClick={() => navigate('/configurations')}
            onMouseEnter={() => setHoveredItem('/configurations')}
            onMouseLeave={() => setHoveredItem(null)}
            disableRipple
            className={`navbar-icon-button ${hoveredItem === '/configurations' || currentPath === '/configurations' ? 'navbar-icon-active' : ''}`}
          >
            <SettingsIcon sx={{ width: 36, height: 36 }} />
          </IconButton>

          <IconButton
            onClick={() => navigate('/')}
            onMouseEnter={() => setHoveredItem('/')}
            onMouseLeave={() => setHoveredItem(null)}
            disableRipple
            className={`navbar-icon-button ${hoveredItem === '/' && currentPath !== '/' ? 'navbar-icon-active' : ''}`}
          >
            <PowerSettingsNewIcon sx={{ width: 36, height: 36 }} />
          </IconButton>
        </Box>

        <Box
          ref={searchBoxRef}
          className='navbar-search-box'
          sx={{
            transform: isSearchActive ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.8)',
            opacity: isSearchActive ? 1 : 0,
            pointerEvents: isSearchActive ? 'auto' : 'none',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}
        >
          <InputBase
            autoFocus
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder='Search...'
            sx={{ width: '100%', fontSize: '1rem' }}
          />
          <IconButton onClick={closeSearch} sx={{ color: PALETTE_COLORS.neon_orange }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <IconButton
        onClick={() => navigate('/newprofils')}
        onMouseEnter={() => setHoveredItem('profile')}
        onMouseLeave={() => setHoveredItem(null)}
        disableRipple
        sx={{ padding: 0 }}
      >
        <Box
          className='navbar-profile'
          sx={{
            bgcolor: hoveredItem === 'profile' || isProfilePage ? PALETTE_COLORS.neon_orange : '#fff',
          }}
        >
          <AccountCircleIcon sx={{ width: 48, height: 48, color: PALETTE_COLORS.black }} />
        </Box>
      </IconButton>
    </Box>
  );
};
