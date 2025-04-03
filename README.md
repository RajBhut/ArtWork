# Artlab - Art Gallery Management System

Artlab is a comprehensive art gallery management system that allows gallery owners to manage artists, artworks, exhibitions, and sales. The application provides a user-friendly interface for both administrators and customers to interact with the gallery's collection.

## Features

### For Gallery Administrators

- **Dashboard**: View key metrics including total artworks, artists, exhibitions, and sales
- **Artist Management**: Add, edit, and delete artist profiles with contact information
- **Artwork Management**: Catalog artworks with details like title, description, medium, dimensions, and price
- **Exhibition Management**: Create and manage exhibitions with start/end dates and location information
- **Sales Tracking**: Monitor sales, track revenue, and view sales history
- **Activity Monitoring**: View recent activities across the platform

### For Customers

- **Browse Artworks**: View available artworks with detailed information
- **Purchase Artworks**: Complete purchase process with shipping and payment information
- **View Exhibitions**: See current and upcoming exhibitions

## Technology Stack

### Frontend

- **React.js**: User interface framework
- **React Router**: Navigation and routing
- **Tailwind CSS**: Styling and responsive design
- **Context API**: State management for authentication

### Backend

- **Node.js**: Server runtime
- **Express.js**: Web application framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication

## Project Structure

```
Artlab/
├── src/                  # Frontend source code
│   ├── components/       # Reusable UI components
│   ├── context/          # React context providers
│   ├── pages/            # Page components
│   ├── services/         # API services
│   └── App.jsx           # Main application component
│
└── Back/                 # Backend source code
    ├── api/              # API routes and controllers
    ├── models/           # Database models
    ├── middleware/       # Express middleware
    └── server.js         # Server entry point
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to the Back directory:

   ```
   cd Back
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file with the following variables:

   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/artlab
   JWT_SECRET=your_jwt_secret
   ```

4. Start the server:
   ```
   npm start
   ```

### Frontend Setup

1. Navigate to the Artlab directory:

   ```
   cd Artlab
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:

   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Artists

- `GET /api/artists` - Get all artists
- `GET /api/artists/:id` - Get artist by ID
- `POST /api/artists` - Create a new artist
- `PUT /api/artists/:id` - Update an artist
- `DELETE /api/artists/:id` - Delete an artist

### Artworks

- `GET /api/artworks` - Get all artworks
- `GET /api/artworks/:id` - Get artwork by ID
- `POST /api/artworks` - Create a new artwork
- `PUT /api/artworks/:id` - Update an artwork
- `DELETE /api/artworks/:id` - Delete an artwork

### Exhibitions

- `GET /api/exhibitions` - Get all exhibitions
- `GET /api/exhibitions/:id` - Get exhibition by ID
- `POST /api/exhibitions` - Create a new exhibition
- `PUT /api/exhibitions/:id` - Update an exhibition
- `DELETE /api/exhibitions/:id` - Delete an exhibition

### Sales

- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get sale by ID
- `POST /api/sales` - Create a new sale

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the artists and galleries who provided inspiration
"# ArtWork" 
