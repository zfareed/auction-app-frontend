import axios from 'axios';
import { AuctionResponse, AuctionDetail } from '../types/auction';

const API_URL = import.meta.env.VITE_API_URL || "https://auction-app-backend-7qzc.onrender.com";

const api = axios.create({
  baseURL: API_URL
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

// Add this function to fetch users
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};