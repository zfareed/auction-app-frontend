import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  CardActions, 
  Button,
  Box,
  Chip
} from '@mui/material';
import { formatDistanceToNow, isPast } from 'date-fns';
import { Auction } from '../../types/auction';

interface AuctionCardProps {
  auction: Auction;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ auction }) => {
  const isAuctionEnded = isPast(new Date(auction.auctionEndTime));
  const timeRemaining = formatDistanceToNow(new Date(auction.auctionEndTime), { addSuffix: true });

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2">
          {auction.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {auction.description}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Starting Price:</Typography>
          <Typography variant="body2" fontWeight="bold">
            ${parseFloat(auction.startingPrice).toFixed(2)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2">Current Bid:</Typography>
          <Typography variant="body2" fontWeight="bold" color="primary">
            ${parseFloat(auction.currentHighestBid).toFixed(2)}
          </Typography>
        </Box>
        <Chip 
          label={isAuctionEnded ? 'Auction Ended' : `Ends ${timeRemaining}`}
          color={isAuctionEnded ? 'error' : 'success'}
          size="small"
        />
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          variant="contained" 
          fullWidth
          disabled={isAuctionEnded}
        >
          {isAuctionEnded ? 'Auction Ended' : 'Place Bid'}
        </Button>
      </CardActions>
    </Card>
  );
};
