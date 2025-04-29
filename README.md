# Auction App Frontend

A real-time auction platform that allows users to see auction items, view detailed information about auction item and place bids with live updates.

## Features

- Browse active auction listings  
- View detailed information about auction items including current highest bid  
- Real-time bid updates via WebSockets  
- Place bids on active auctions  
- Auction countdown timers  
- Add new auction item

## Technologies Used

- React 18 with TypeScript  
- Material UI for component styling  
- TanStack React Query for data fetching  
- Socket.IO for real-time WebSocket communication  
- React Router for navigation  
- Date-fns for date manipulation  
- Vite as build tool  



## API Integration

The application connects to a backend API for all data operations. Key endpoints include:

- `GET /items` - Fetch all auction items  
- `GET /items/:id` - Fetch details for a specific auction  
- `POST /bids` - Place a bid on an auction item  
- `POST /items` - Create a new auction item  

## WebSocket Integration

Real-time features are implemented using Socket.IO. The app:

- Connects to the WebSocket server on component mount  
- Joins auction-specific rooms for targeted updates  
- Listens for new bid events to update the UI in real-time  
- Disconnects properly when components unmount  

## Getting Started

### Prerequisites

- Node.js (v20 or later)
- npm (v9 or later)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/zfareed/auction-app-frontend
   cd auction-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```env
   VITE_API_URL=auction-app-backend-url
   ```
### Running the Application

#### Development Mode

```bash
npm run dev
```

The application will start in development mode and be available at `http://localhost:5173`.

#### Production Build

```bash
npm run build
```

This will create an optimized production build in the `dist` directory.


You can also run the application using Docker:

1. Build the Docker image:

   ```bash
   docker build -t auction-app-frontend --build-arg VITE_API_URL=auction-app-backend-url .
   ```

2. Run the container:

   ```bash
   docker run -p 5173:80 auction-app-frontend
   ```

The application will be available at `http://localhost:5173`.


## CI/CD Pipeline

The application is set up with a continuous integration and deployment pipeline using GitHub Actions.

### Pipeline Configuration

The CI/CD pipeline is configured in `.github/workflows/frontend-deploy.yml` with the following functionality:

- **Trigger**: The pipeline runs automatically on code pushes to the `master` branch
- **Deployment**: The application is deployed to Render using a deploy webhook

### Running the Pipeline

The pipeline runs automatically when code is pushed to the master branch. No manual steps are required.