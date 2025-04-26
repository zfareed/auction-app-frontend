import axios from 'axios';
import { AuctionResponse, AuctionDetail } from '../types/auction';

const api = axios.create({
  baseURL: 'http://localhost:3000'
});

export const getAuctions = async (): Promise<AuctionResponse> => {
  const response = await api.get('/items');
  return response.data;
};

export const getAuctionById = async (id: string | undefined): Promise<AuctionDetail> => {
  if (!id) throw new Error('Auction ID is required');
  const response = await api.get(`/items/${id}`);
  return response.data;
};

export const placeBid = async (itemId: number, amount: number, userId = 1): Promise<any> => {
  const response = await api.post('/bids', {
    userId,
    itemId,
    amount
  });
  return response.data;
};

// Add the new function to create auction items
export interface NewAuctionItem {
  name: string;
  description: string;
  startingPrice: number;
  auctionEndTime: string;
}

export const addAuctionItem = async (item: NewAuctionItem): Promise<any> => {
  const response = await api.post('/items', item);
  return response.data;
};