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
