import { Box, Paper, Typography, Divider, Stack, IconButton } from '@mui/material';
import { Phone as PhoneIcon, Email as EmailIcon } from '@mui/icons-material';
import { CARD_CONTACT, CARD_CONTACT_STACK, CARD_MESSAGE, CARD_NAME, CARD_NAME_UNDERLINE, LINK, LOGO, P_CARD } from './style';
import { mailTo, phoneTo } from 'src/common/utils';

export const PartnersContainer = ({ partner }) => {
  const { imageSrc, name, message, phone, email } = partner;
  return (
    <Paper sx={P_CARD}>
      <img src={imageSrc} alt={`log-${name}`} style={LOGO} />
      <Box sx={CARD_MESSAGE}>
        <Typography component='div' mb={1} variant='p'>
          {message}
        </Typography>
      </Box>

      <Typography sx={CARD_NAME} component='div' variant='h7'>
        {name}
      </Typography>
      <Divider sx={CARD_NAME_UNDERLINE} />
      <Box sx={CARD_CONTACT}>
        <Stack sx={CARD_CONTACT_STACK}>
          <Typography sx={LINK}>{phone}</Typography>
          <IconButton size='small' onClick={() => phoneTo(phone)}>
            <PhoneIcon />
          </IconButton>
        </Stack>

        <Stack sx={CARD_CONTACT_STACK}>
          <Typography sx={LINK} href={`mailto:${email}`}>
            {email}
          </Typography>
          <IconButton size='small' onClick={() => mailTo(email)}>
            <EmailIcon />
          </IconButton>
        </Stack>
      </Box>
    </Paper>
  );
};
