import ArrowRightRoundedIcon from '@mui/icons-material/ArrowRightRounded';
import { Card, CardContent, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { subscriptionFeatures } from './subscriptionFeatures';

export const SubscriptionCard = () => {
  return (
    <Card className='card subscription-card'>
      <CardContent>
        <Typography className='section-title-subscription'>Mon abonnement</Typography>
        <Typography className='price-subscription'>Pour 49 € par mois :</Typography>

        <List disablePadding>
          {subscriptionFeatures.map((item, index) => (
            <ListItem key={index} className='list-subscription' sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <ArrowRightRoundedIcon className='arrow-list' />
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};
