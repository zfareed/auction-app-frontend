import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  CardActions, 
  Button,
  Box,
  Chip,
  Stack
} from '@mui/material';
import { formatDistanceToNow, isPast } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GavelIcon from '@mui/icons-material/Gavel';
import { Auction } from '../../types/auction';

interface AuctionCardProps {
  auction: Auction;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ auction }) => {
  const navigate = useNavigate();
  const isAuctionEnded = isPast(new Date(auction.auctionEndTime));
  const timeRemaining = formatDistanceToNow(new Date(auction.auctionEndTime), { addSuffix: true });

  return (
    <Card 
      sx={{ 
        width: '100%',
        height: '100%',
        minHeight: 350,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        boxShadow: 2,
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-4px)',
        },
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Stack spacing={2} height="100%">
          <Box>
            <Typography 
              variant="h5" 
              component="h2"
              sx={{ 
                fontWeight: 600,
                color: 'primary.main',
                mb: 1
              }}
            >
              {auction.name}
            </Typography>

            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: '2.5em'
              }}
            >
              {auction.description}
            </Typography>
          </Box>

          <Box sx={{ mt: 'auto' }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Starting Price:
                </Typography>
                <Typography variant="h6">
                  ${parseFloat(auction.startingPrice).toFixed(2)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  <GavelIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                  Current Bid:
                </Typography>
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                  ${parseFloat(auction.currentHighestBid).toFixed(2)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon 
                  sx={{ 
                    color: isAuctionEnded ? 'error.main' : 'success.main',
                    fontSize: 20 
                  }} 
                />
                <Chip 
                  label={isAuctionEnded ? 'Auction Ended' : `Ends ${timeRemaining}`}
                  color={isAuctionEnded ? 'error' : 'success'}
                  size="small"
                  sx={{ borderRadius: 1 }}
                />
              </Box>
            </Stack>
          </Box>
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button 
          fullWidth
          variant="contained"
          onClick={() => navigate(`/auction/${auction.id}`)}
          sx={{ 
            borderRadius: 1,
            py: 1,
            textTransform: 'none',
            fontSize: '1rem'
          }}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};
