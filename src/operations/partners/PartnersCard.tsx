import { Box, Button, Paper, Typography } from '@mui/material';
import { Partner } from './partners';
import {
  LOGO,
  P_CARD,
  P_CARD_BUTTON,
  P_CARD_BUTTON_CONTAINER,
  P_CARD_TEXT_BODY,
  P_CARD_TEXT_BODY_CONTAINER,
  P_CARD_TEXT_HEADER,
  P_CARD_TEXT_HEADER_CONTAINER,
  P_CORNER,
} from './style';

interface PartnersCardProps {
  partner: Partner;
}

const HeaderMessage = ({ messages }: { messages: Partner['headerMessage'] }) => {
  return (
    <Box sx={P_CARD_TEXT_HEADER_CONTAINER}>
      {messages.map((message, index) => (
        <Typography key={`partners-headerMessage-${index}`} sx={{ ...P_CARD_TEXT_HEADER, color: message.color || 'white' }}>
          {message.message}
        </Typography>
      ))}
    </Box>
  );
};

const BodyMessage = ({ messages }: { messages: Partner['bodyMessage'] }) => {
  return (
    <Box sx={P_CARD_TEXT_BODY_CONTAINER}>
      {messages.map((message, index) => (
        <Typography sx={{ ...P_CARD_TEXT_BODY, fontWeight: message.type }} key={`partners-card-bodyMessage-${index}`}>
          {message.message}
        </Typography>
      ))}
    </Box>
  );
};

export const PartnersCard = ({ partner }: PartnersCardProps) => {
  const { imageSrc, bodyMessage, buttonLabel, headerMessage, cornerPosition, redirectionLink } = partner;
  return (
    <Paper sx={P_CARD}>
      <Box sx={{ ...P_CORNER, ...cornerPosition } as any}></Box>
      <HeaderMessage messages={headerMessage} />
      <BodyMessage messages={bodyMessage} />
      <Box sx={P_CARD_BUTTON_CONTAINER}>
        <Button sx={P_CARD_BUTTON} target='_blank' href={redirectionLink}>
          {buttonLabel}
        </Button>
      </Box>
      <img src={imageSrc} alt={`logo-bred-${buttonLabel}`} style={LOGO} />
    </Paper>
  );
};
