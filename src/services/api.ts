import axios from 'axios';
import { AuctionResponse } from '../types/auction';

const api = axios.create({
  baseURL: 'http://localhost:3000'
});

export const getAuctions = async (): Promise<AuctionResponse> => {
  const response = await api.get('/items');
  return response.data;
};
