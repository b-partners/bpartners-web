import { PALETTE_COLORS } from '@/common/config/theme';
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
    <Box
      position='fixed'
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      display='flex'
      alignItems='center'
      justifyContent='space-between'
      px={2}
      py={1}
      bgcolor={PALETTE_COLORS.white}
      height='80px'
    >
      <Box display='flex' alignItems='center' gap={1}>
        <img src='/b-logo.png' alt='Birdia logo' width={40} height={40} />
        <Box fontWeight='bold' fontSize='2rem'>
          BIRDIA
        </Box>
      </Box>
      <Box
        position='relative'
        display='flex'
        alignItems='center'
        justifyContent='center'
        gap={2}
        px={3}
        py={1}
        borderRadius={6}
        boxShadow='0px 4px 12px rgba(0, 0, 0, 0.1)'
        bgcolor='#fff'
        minHeight='60px'
        width={600}
      >
        <Box display={isSearchActive ? 'none' : 'flex'} alignItems='center' gap={2} width='100%' justifyContent='center'>
          <IconButton
            onClick={openSearch}
            onMouseEnter={() => setHoveredItem('search')}
            onMouseLeave={() => setHoveredItem(null)}
            disableRipple
            sx={{
              borderBottom: hoveredItem === 'search' ? `3px solid ${PALETTE_COLORS.neon_orange}` : '3px solid transparent',
              borderRadius: 0,
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
          >
            <SearchIcon sx={{ width: 36, height: 36 }} />
          </IconButton>

          <Box width={2} height={24} bgcolor='#E0E0E0' mx={1} />

          {navLinks.map(({ icon, path }, index) => (
            <IconButton
              key={index}
              onClick={() => navigate(path)}
              onMouseEnter={() => setHoveredItem(path)}
              onMouseLeave={() => setHoveredItem(null)}
              disableRipple
              sx={{
                borderBottom: hoveredItem === path || currentPath === path ? `3px solid ${PALETTE_COLORS.neon_orange}` : '3px solid transparent',
                borderRadius: 0,
                ...(currentPath !== path && {
                  transition: 'border-bottom 0.2s ease',
                }),
                '&:hover': { backgroundColor: 'transparent' },
              }}
            >
              {React.cloneElement(icon, { color: PALETTE_COLORS.black })}
            </IconButton>
          ))}

          <Box width={2} height={24} bgcolor='#E0E0E0' mx={1} />

          <IconButton
            onClick={() => navigate('/configurations')}
            onMouseEnter={() => setHoveredItem('/configurations')}
            onMouseLeave={() => setHoveredItem(null)}
            disableRipple
            sx={{
              borderBottom:
                hoveredItem === '/configurations' || currentPath === '/configurations' ? `3px solid ${PALETTE_COLORS.neon_orange}` : '3px solid transparent',
              borderRadius: 0,
              '&:hover': { backgroundColor: 'transparent' },
            }}
          >
            <SettingsIcon sx={{ width: 36, height: 36 }} />
          </IconButton>

          <IconButton
            onClick={() => navigate('/')}
            onMouseEnter={() => setHoveredItem('/')}
            onMouseLeave={() => setHoveredItem(null)}
            disableRipple
            sx={{
              borderBottom: hoveredItem === '/' && currentPath !== '/' ? `3px solid ${PALETTE_COLORS.neon_orange}` : '3px solid transparent',
              borderRadius: 0,
              '&:hover': { backgroundColor: 'transparent' },
            }}
          >
            <PowerSettingsNewIcon sx={{ width: 36, height: 36 }} />
          </IconButton>
        </Box>
        <Box
          ref={searchBoxRef}
          position='absolute'
          top='50%'
          left='50%'
          sx={{
            transform: isSearchActive ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.8)',
            opacity: isSearchActive ? 1 : 0,
            pointerEvents: isSearchActive ? 'auto' : 'none',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            width: 520,
            bgcolor: '#fff',
            px: 2,
            py: 0.5,
            borderRadius: 2,
            boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
            border: `1px solid ${PALETTE_COLORS.black}`,
            zIndex: 10,
          }}
        >
          <InputBase
            autoFocus
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder='Search...'
            sx={{
              width: '100%',
              fontSize: '1rem',
            }}
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
          px={2}
          py={1}
          borderRadius='25%'
          boxShadow='0px 4px 12px rgba(0, 0, 0, 0.1)'
          bgcolor={hoveredItem === 'profile' || isProfilePage ? PALETTE_COLORS.neon_orange : '#fff'}
          display='flex'
          alignItems='center'
          justifyContent='center'
          sx={{
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
        >
          <AccountCircleIcon sx={{ width: 48, height: 48, color: PALETTE_COLORS.black }} />
        </Box>
      </IconButton>
    </Box>
  );
};
