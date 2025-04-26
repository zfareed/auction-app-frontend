export interface Auction {
  id: number;
  name: string;
  description: string;
  startingPrice: string;
  currentHighestBid: string;
  createdAt: string;
  auctionEndTime: string;
}

export interface AuctionResponse {
  items: Auction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
