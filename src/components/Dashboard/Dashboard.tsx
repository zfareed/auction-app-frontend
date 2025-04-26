import React from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  CircularProgress 
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getAuctions } from '../../services/api';
import { AuctionCard } from './AuctionCard';

export const Dashboard: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['auctions'],
    queryFn: getAuctions
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">Error loading auctions. Please try again later.</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Active Auctions
      </Typography>
      <Grid container spacing={4}>
        {data?.items.map((auction) => (
          <Grid item key={auction.id} xs={12} sm={6} md={4}>
            <AuctionCard auction={auction} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
