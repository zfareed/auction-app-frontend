import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Stack,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CloseIcon from '@mui/icons-material/Close';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addAuctionItem } from '../../services/api';

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({ open, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [endDate, setEndDate] = useState<Date | null>(
    // Default to 7 days from now
    new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
  );
  const [error, setError] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  
  const addItemMutation = useMutation({
    mutationFn: addAuctionItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      handleClose();
    },
    onError: (err) => {
      console.error('Error adding item:', err);
      setError('Failed to add item. Please try again.');
    }
  });
  
  const handleSubmit = () => {
    // Validate inputs
    if (!name.trim()) {
      setError('Item name is required');
      return;
    }
    
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    
    if (!startingPrice || parseFloat(startingPrice) <= 0) {
      setError('Starting price must be greater than 0');
      return;
    }
    
    if (!endDate) {
      setError('End date is required');
      return;
    }
    
    // Check if end date is in the future
    if (endDate.getTime() <= new Date().getTime()) {
      setError('End date must be in the future');
      return;
    }
    
    // Submit the form
    addItemMutation.mutate({
      name,
      description,
      startingPrice: parseFloat(startingPrice),
      auctionEndTime: endDate.toISOString()
    });
  };
  
  const handleClose = () => {
    // Reset form
    setName('');
    setDescription('');
    setStartingPrice('');
    setEndDate(new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000));
    setError(null);
    onClose();
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h5" fontWeight="bold">Add New Auction Item</Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <TextField
            label="Item Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter the item name"
            variant="outlined"
          />
          
          <TextField
            label="Description"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the item in detail"
            multiline
            rows={4}
            variant="outlined"
          />
          
          <TextField
            label="Starting Price"
            fullWidth
            type="number"
            value={startingPrice}
            onChange={(e) => setStartingPrice(e.target.value)}
            placeholder="Enter starting bid amount"
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            variant="outlined"
          />
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Auction End Date & Time"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                  helperText: 'When will the auction end?'
                }
              }}
            />
          </LocalizationProvider>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={handleClose} 
          variant="outlined"
          sx={{ borderRadius: 1 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={addItemMutation.isPending}
          sx={{ 
            borderRadius: 1,
            px: 3
          }}
        >
          {addItemMutation.isPending ? 'Adding...' : 'Add Item'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 