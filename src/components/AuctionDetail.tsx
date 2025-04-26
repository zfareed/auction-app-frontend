import React from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Grid, 
  Button, 
  TextField,
  CircularProgress,
  Divider,
  Stack,
  useTheme,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow, format } from 'date-fns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GavelIcon from '@mui/icons-material/Gavel';
import { getAuctionById } from '../services/api';

export const AuctionDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [bidAmount, setBidAmount] = React.useState('');

  const { data: auction, isLoading } = useQuery({
    queryKey: ['auction', id],
    queryFn: () => getAuctionById(id),
  });

  if (isLoading || !auction) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const isAuctionEnded = auction.status === 'ended';
  const timeRemaining = formatDistanceToNow(new Date(auction.auctionEndTime), { addSuffix: true });

  return (
    <Box sx={{ bgcolor: theme.palette.grey[100], minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 3 }}
        >
          Back to Auctions
        </Button>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }} elevation={2}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                {auction.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {auction.description}
              </Typography>
              
              <Divider sx={{ my: 3 }} />

              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon color={isAuctionEnded ? 'error' : 'success'} />
                  <Typography>
                    {isAuctionEnded ? 'Auction Ended' : `Ends ${timeRemaining}`}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Auction started on {format(new Date(auction.createdAt), 'PPP')}
                </Typography>
              </Stack>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 2 }} elevation={2}>
              <Typography variant="h6" gutterBottom>
                Bid History
              </Typography>
              <List>
                {auction.bids.map((bid) => (
                  <ListItem key={bid.id} divider>
                    <ListItemText
                      primary={`$${parseFloat(bid.amount).toFixed(2)}`}
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="text.primary">
                            {bid.username}
                          </Typography>
                          {' - '}
                          {format(new Date(bid.createdAt), 'PPp')}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 2 }} elevation={2}>
              <Typography variant="h6" gutterBottom>
                Bidding Information
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Starting Price
                  </Typography>
                  <Typography variant="h6">
                    ${parseFloat(auction.startingPrice).toFixed(2)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Current Highest Bid
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    ${parseFloat(auction.currentHighestBid).toFixed(2)}
                  </Typography>
                </Box>

                {!isAuctionEnded && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Your Bid Amount"
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      InputProps={{
                        startAdornment: <Typography>$</Typography>
                      }}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={!bidAmount || parseFloat(bidAmount) <= parseFloat(auction.currentHighestBid)}
                    >
                      Place Bid
                    </Button>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};