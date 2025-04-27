import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private connected = false;

  connect() {
    if (!this.connected) {
      // Connect to the same URL as the backend but on the WebSocket port
      const SOCKET_URL = import.meta.env.VITE_API_URL || "https://auction-app-backend-7qzc.onrender.com";

      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        withCredentials: true,
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        this.connected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        this.connected = false;
      });

      this.socket.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  joinAuction(auctionId: number) {
    if (this.socket) {
      this.socket.emit('joinAuction', auctionId);
    }
  }

  leaveAuction(auctionId: number) {
    if (this.socket) {
      this.socket.emit('leaveAuction', auctionId);
    }
  }

  onNewBid(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('newBid', callback);
    }
  }

  removeNewBidListener() {
    if (this.socket) {
      this.socket.off('newBid');
    }
  }
}

// Create a singleton instance
export const webSocketService = new WebSocketService(); 