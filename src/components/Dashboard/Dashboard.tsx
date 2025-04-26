import React, { useState } from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  CircularProgress,
  useTheme,
  Button,
  Fab
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getAuctions } from '../../services/api';
import { AuctionCard } from './AuctionCard';
import { AddItemModal } from './AddItemModal';
import AddIcon from '@mui/icons-material/Add';

export const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['auctions'],
    queryFn: getAuctions
  });

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography color="error">Error loading auctions. Please try again later.</Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        width: '100vw',
        minHeight: '100vh',
        bgcolor: theme.palette.grey[100],
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Box sx={{ width: '100%', bgcolor: theme.palette.primary.main, py: 4, mb: 4 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 600,
                  color: 'white'
                }}
              >
                Live Auctions
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: 'white',
                  opacity: 0.9
                }}
              >
                Discover unique items and place your bids
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={handleOpenAddModal}
              sx={{
                fontWeight: 'bold',
                px: 3,
                py: 1.2,
                bgcolor: 'white',
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.grey[100],
                }
              }}
            >
              Add New Item
            </Button>
          </Box>
        </Container>
      </Box>

      <Container 
        maxWidth="xl" 
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 1800,
            mx: 'auto',
            px: 2
          }}
        >
          <Grid 
            container 
            spacing={3}
            sx={{ 
              width: '100%',
              margin: '0 auto',
            }}
          >
            {data?.items.map((auction) => (
              <Grid 
                item 
                xs={12}
                sm={6}
                md={4}
                key={auction.id}
                sx={{ 
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Box 
                  sx={{ 
                    width: '100%',
                    maxWidth: 400,
                    minWidth: { sm: 300 }
                  }}
                >
                  <AuctionCard auction={auction} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
      
      {/* Floating action button for mobile */}
      <Box sx={{ 
        position: 'fixed', 
        bottom: 24, 
        right: 24, 
        display: { xs: 'block', md: 'none' } 
      }}>
        <Fab 
          color="primary" 
          aria-label="add" 
          onClick={handleOpenAddModal}
          sx={{ boxShadow: 3 }}
        >
          <AddIcon />
        </Fab>
      </Box>
      
      {/* Add Item Modal */}
      <AddItemModal 
        open={isAddModalOpen} 
        onClose={handleCloseAddModal} 
      />
    </Box>
  );
};
