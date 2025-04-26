import React, { useState, useEffect } from 'react';
import { 
  Container, 
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
  ListItemText,
  Alert,
  Snackbar,
  Avatar,
  Chip,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, format, differenceInSeconds } from 'date-fns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GavelIcon from '@mui/icons-material/Gavel';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PersonIcon from '@mui/icons-material/Person';
import TimerIcon from '@mui/icons-material/Timer';
import { getAuctionById, placeBid } from '../services/api';
import { webSocketService } from '../services/websocket.service';
import { Bid } from '../types/auction';

// Helper function to format time
const formatTimeRemaining = (milliseconds: number) => {
  if (milliseconds <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
  const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  
  return { days, hours, minutes, seconds };
};

export const AuctionDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [bidAmount, setBidAmount] = React.useState('');
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const queryClient = useQueryClient();

  const { data: auction, isLoading } = useQuery({
    queryKey: ['auction', id],
    queryFn: () => getAuctionById(id),
    refetchInterval: 10000, // We can reduce this since we'll get real-time updates
  });

  // Connect to WebSocket and join the auction room when the component mounts
  useEffect(() => {
    if (id) {
      const socket = webSocketService.connect();
      webSocketService.joinAuction(Number(id));
      
      // Listen for new bids
      webSocketService.onNewBid((newBid: Bid) => {
        // Update the auction data with the new bid
        queryClient.setQueryData(['auction', id], (oldData: any) => {
          if (!oldData) return oldData;
          
          // Check if this bid is already in our list (to prevent duplicates)
          const bidExists = oldData.bids.some((bid: Bid) => bid.id === newBid.id);
          if (bidExists) return oldData;
          
          // Create a new array with the new bid at the start
          const updatedBids = [newBid, ...oldData.bids];
          
          // Update the auction data
          return {
            ...oldData,
            bids: updatedBids,
            currentHighestBid: newBid.amount,
          };
        });
        
        // Show a notification for new bids from others
        setSnackbar({
          open: true,
          message: `New bid of $${parseFloat(newBid.amount).toFixed(2)} by ${newBid.username}!`,
          severity: 'info'
        });
      });
      
      // Clean up when component unmounts
      return () => {
        webSocketService.leaveAuction(Number(id));
        webSocketService.removeNewBidListener();
      };
    }
  }, [id, queryClient]);

  // Update countdown timer every second
  useEffect(() => {
    if (!auction || auction.status === 'ended') return;
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const endTime = new Date(auction.auctionEndTime).getTime();
      const timeRemaining = Math.max(0, endTime - now);
      
      setTimeLeft(formatTimeRemaining(timeRemaining));
      
      // If time is up, refetch to update auction status
      if (timeRemaining <= 0) {
        queryClient.invalidateQueries({ queryKey: ['auction', id] });
      }
    };
    
    // Initial update
    updateTimer();
    
    // Set up interval
    const timerId = setInterval(updateTimer, 1000);
    
    // Clean up
    return () => clearInterval(timerId);
  }, [auction, id, queryClient]);

  const bidMutation = useMutation({
    mutationFn: (amount: number) => placeBid(Number(id), amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auction', id] });
      setBidAmount('');
      setSnackbar({
        open: true,
        message: 'Bid placed successfully!',
        severity: 'success'
      });
    },
    onError: (error) => {
      console.error('Error placing bid:', error);
      setSnackbar({
        open: true,
        message: 'Failed to place bid. Please try again.',
        severity: 'error'
      });
    }
  });

  const handleBidSubmit = () => {
    if (!bidAmount || parseFloat(bidAmount) <= parseFloat(auction?.currentHighestBid || '0')) {
      setSnackbar({
        open: true,
        message: 'Bid amount must be higher than the current highest bid.',
        severity: 'error'
      });
      return;
    }
    
    bidMutation.mutate(parseFloat(bidAmount));
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (isLoading || !auction) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" flexDirection="column" gap={2}>
        <Typography variant="h6" color="text.secondary">Loading auction details...</Typography>
        <CircularProgress size={60} />
      </Box>
    );
  }

  const isAuctionEnded = auction.status === 'ended';
  const timeRemaining = formatDistanceToNow(new Date(auction.auctionEndTime), { addSuffix: true });
  
  // Calculate percentage of time remaining for progress bar
  const totalAuctionDuration = differenceInSeconds(
    new Date(auction.auctionEndTime),
    new Date(auction.createdAt)
  );
  const secondsRemaining = auction.timeRemaining / 1000;
  const timeRemainingPercentage = Math.max(
    0,
    Math.min(100, (secondsRemaining / totalAuctionDuration) * 100)
  );

  // Calculate bid increase percentage
  const startingPrice = parseFloat(auction.startingPrice);
  const currentBid = parseFloat(auction.currentHighestBid);
  const bidIncreasePercentage = startingPrice > 0 
    ? Math.round(((currentBid - startingPrice) / startingPrice) * 100) 
    : 0;

  return (
    <Box sx={{ 
      bgcolor: theme.palette.grey[50], 
      minHeight: '100vh', 
      py: 4,
      backgroundImage: 'linear-gradient(to bottom, rgba(25, 118, 210, 0.05), rgba(255, 255, 255, 1))'
    }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ 
            mb: 4, 
            bgcolor: 'white', 
            boxShadow: 1,
            '&:hover': {
              bgcolor: theme.palette.grey[100],
            }
          }}
        >
          Back to Auctions
        </Button>
        

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card 
              elevation={3} 
              sx={{ 
                borderRadius: 3, 
                mb: 4, 
                overflow: 'visible',
                position: 'relative'
              }}
            >
              {!isAuctionEnded && (
                <Box sx={{ 
                  position: 'absolute', 
                  top: -15, 
                  right: 20, 
                  zIndex: 10 
                }}>
                  <Chip
                    icon={<AccessTimeIcon />}
                    label={`Ends ${timeRemaining}`}
                    color="primary"
                    sx={{ 
                      py: 2.5, 
                      px: 1, 
                      fontWeight: 'bold',
                      boxShadow: 2
                    }}
                  />
                </Box>
              )}
              
              {isAuctionEnded && (
                <Box sx={{ 
                  position: 'absolute', 
                  top: -15, 
                  right: 20, 
                  zIndex: 10 
                }}>
                  <Chip
                    icon={<AccessTimeIcon />}
                    label="Auction Ended"
                    color="error"
                    sx={{ 
                      py: 2.5, 
                      px: 1, 
                      fontWeight: 'bold',
                      boxShadow: 2
                    }}
                  />
                </Box>
              )}
              
              <CardContent sx={{ p: 4 }}>
                <Typography 
                  variant="h4" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.primary.dark,
                    mb: 2
                  }}
                >
                  {auction.name}
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    fontSize: '1.1rem',
                    lineHeight: 1.6,
                    mb: 3
                  }}
                >
                  {auction.description}
                </Typography>
                
                <Divider sx={{ my: 3 }} />
                
                {!isAuctionEnded && (
                  <>
                    <Box sx={{ 
                      mb: 3, 
                      p: 3, 
                      bgcolor: theme.palette.grey[50], 
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.grey[200]}`
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TimerIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                        <Typography variant="h6" fontWeight="medium">
                          Auction Ends In:
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={2} sx={{ textAlign: 'center' }}>
                        <Grid item xs={3}>
                          <Box sx={{ 
                            bgcolor: 'white', 
                            p: 1, 
                            borderRadius: 2,
                            boxShadow: 1
                          }}>
                            <Typography variant="h4" fontWeight="bold" color="primary.main">
                              {timeLeft.days}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Days
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={3}>
                          <Box sx={{ 
                            bgcolor: 'white', 
                            p: 1, 
                            borderRadius: 2,
                            boxShadow: 1
                          }}>
                            <Typography variant="h4" fontWeight="bold" color="primary.main">
                              {timeLeft.hours}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Hours
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={3}>
                          <Box sx={{ 
                            bgcolor: 'white', 
                            p: 1, 
                            borderRadius: 2,
                            boxShadow: 1
                          }}>
                            <Typography variant="h4" fontWeight="bold" color="primary.main">
                              {timeLeft.minutes}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Minutes
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={3}>
                          <Box sx={{ 
                            bgcolor: 'white', 
                            p: 1, 
                            borderRadius: 2,
                            boxShadow: 1
                          }}>
                            <Typography variant="h4" fontWeight="bold" color={timeLeft.seconds < 10 ? "error.main" : "primary.main"}>
                              {timeLeft.seconds}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Seconds
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ mt: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Time Remaining
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {timeRemaining}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={timeRemainingPercentage} 
                          color={timeRemainingPercentage < 20 ? "error" : "primary"}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </Box>
                  </>
                )}

                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Auction started on {format(new Date(auction.createdAt), 'PPP')}
                    </Typography>
                  </Box>
                  
                  {bidIncreasePercentage > 0 && (
                    <Chip 
                      label={`Price increased by ${bidIncreasePercentage}% from starting price`}
                      color="success"
                      size="small"
                      sx={{ alignSelf: 'flex-start', mt: 1 }}
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <GavelIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6" fontWeight="bold">
                    Bid History
                  </Typography>
                </Box>
                
                {auction.bids.length === 0 ? (
                  <Box 
                    sx={{ 
                      py: 4, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      bgcolor: theme.palette.grey[50],
                      borderRadius: 2
                    }}
                  >
                    <GavelIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" align="center">
                      No bids have been placed yet.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Be the first to bid on this item!
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ 
                    bgcolor: theme.palette.grey[50], 
                    borderRadius: 2,
                    maxHeight: 400,
                    overflow: 'auto'
                  }}>
                    {auction.bids.map((bid, index) => (
                      <ListItem 
                        key={bid.id} 
                        divider={index !== auction.bids.length - 1}
                        sx={{ 
                          py: 2,
                          bgcolor: index === 0 ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                          borderLeft: index === 0 ? `4px solid ${theme.palette.primary.main}` : 'none',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: index === 0 ? theme.palette.primary.main : theme.palette.grey[400],
                              width: 40,
                              height: 40
                            }}
                          >
                            <PersonIcon />
                          </Avatar>
                        </Box>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography fontWeight={index === 0 ? 'bold' : 'medium'}>
                                {bid.username}
                                {index === 0 && (
                                  <Chip 
                                    label="Highest" 
                                    size="small" 
                                    color="primary" 
                                    sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                                  />
                                )}
                              </Typography>
                              <Typography 
                                variant="h6" 
                                fontWeight="bold"
                                color={index === 0 ? 'primary.main' : 'text.primary'}
                              >
                                ${parseFloat(bid.amount).toFixed(2)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {format(new Date(bid.createdAt), 'PPp')}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              elevation={3} 
              sx={{ 
                borderRadius: 3, 
                position: 'sticky',
                top: 20
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3
                  }}
                >
                  <MonetizationOnIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  Place your bid
                </Typography>
                
                <Stack spacing={3}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: theme.palette.grey[50], 
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.grey[200]}`
                  }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Starting Price
                    </Typography>
                    <Typography variant="h6" fontWeight="medium">
                      ${parseFloat(auction.startingPrice).toFixed(2)}
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    p: 2, 
                    bgcolor: theme.palette.primary.light, 
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.primary.main}`,
                    color: theme.palette.primary.contrastText
                  }}>
                    <Typography variant="body2" gutterBottom sx={{ opacity: 0.9 }}>
                      Current Highest Bid
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      ${parseFloat(auction.currentHighestBid).toFixed(2)}
                    </Typography>
                  </Box>

                  {!isAuctionEnded && (
                    <Box sx={{ mt: 2 }}>
                      <Typography 
                        variant="subtitle2" 
                        gutterBottom 
                        sx={{ 
                          mb: 2,
                          fontWeight: 'medium'
                        }}
                      >
                        Place Your Bid
                      </Typography>
                      
                      <TextField
                        fullWidth
                        label="Your Bid Amount"
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                        }}
                        sx={{ 
                          mb: 2,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                        disabled={bidMutation.isPending}
                        placeholder={`Min. $${(parseFloat(auction.currentHighestBid) + 0.01).toFixed(2)}`}
                      />
                      
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={
                          bidMutation.isPending || 
                          !bidAmount || 
                          parseFloat(bidAmount) <= parseFloat(auction.currentHighestBid)
                        }
                        onClick={handleBidSubmit}
                        sx={{ 
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 'bold',
                          boxShadow: 3,
                          '&:hover': {
                            boxShadow: 5
                          }
                        }}
                        startIcon={<GavelIcon />}
                      >
                        {bidMutation.isPending ? 'Placing Bid...' : 'Place Bid'}
                      </Button>
                      
                      {!bidMutation.isPending && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          align="center"
                          sx={{ mt: 2 }}
                        >
                          Enter an amount higher than the current bid
                        </Typography>
                      )}
                    </Box>
                  )}
                  
                  {isAuctionEnded && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      This auction has ended. No more bids can be placed.
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};