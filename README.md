# JusTalk - Real-Time Video Conferencing with Collaborative Whiteboard

A full-stack video conferencing application with real-time collaborative drawing features, built with React, TypeScript, Node.js, Socket.IO, and WebRTC.

## 🚀 Features

### Video & Audio Communication

- **WebRTC-based peer-to-peer video calls** with multiple participants
- **Audio/Video controls** - Toggle microphone and camera on/off
- **Responsive design** - Optimized for desktop and mobile devices
- **Real-time participant management** - See who's in the room

### Collaborative Whiteboard

- **Real-time drawing synchronization** across all participants
- **Multiple drawing tools**:
  - Customizable stroke colors (10 presets + custom color picker)
  - Adjustable stroke widths (2px, 4px, 6px, 8px, 12px)
  - Undo functionality
  - Clear canvas option
- **Screenshot capture** - Save the current whiteboard state
- **Toggle drawing mode** - Switch between viewing and drawing

### User Management

- **User authentication** - JWT-based secure authentication
- **User profiles** - Manage user information
- **Room management** - Create and join video rooms with unique codes

### Technical Features

- **Socket.IO** for real-time bidirectional communication
- **MongoDB** for data persistence
- **Redux Toolkit** for state management
- **Tailwind CSS** for modern, responsive UI
- **TypeScript** for type-safe development

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/jayzadafiya/JusTalk.git
cd JusTalk
```

### 2. Install dependencies

```bash
# Install all dependencies (root, client, and server)
npm run install:all
```

Or install individually:

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Environment Configuration

#### Server Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/justalk
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/justalk

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

#### Client Environment Variables

Create a `.env` file in the `client` directory (if needed):

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 🚀 Running the Application

### Development Mode

#### Run both client and server concurrently:

```bash
npm run dev
```

#### Or run separately:

**Start the server:**

```bash
npm run dev:server
# Server will run on http://localhost:5000
```

**Start the client:**

```bash
npm run dev:client
# Client will run on http://localhost:3000
```

## 🔑 Key Technologies

### Frontend

- **React** 18.2.0 - UI library
- **TypeScript** 5.3.3 - Type-safe JavaScript
- **Redux Toolkit** 2.0.1 - State management
- **React Router** 6.20.0 - Client-side routing
- **Socket.IO Client** 4.7.2 - Real-time communication
- **Tailwind CSS** 3.3.6 - Utility-first CSS framework
- **Lucide React** - Icon library
- **Vite** 5.0.8 - Build tool and dev server
- **html2canvas** 1.4.1 - Screenshot capture

### Backend

- **Express** 4.18.2 - Web framework
- **TypeScript** 5.3.3 - Type-safe JavaScript
- **Socket.IO** 4.7.2 - Real-time communication
- **MongoDB** with Mongoose 8.0.3 - Database
- **JWT** 9.0.2 - Authentication
- **bcryptjs** 2.4.3 - Password hashing
- **Helmet** 7.1.0 - Security headers
- **CORS** 2.8.5 - Cross-origin resource sharing

## 🎯 API Endpoints

### Authentication & Users

- `POST /api/user/register` - Register new user
- `POST /api/user/login` - User login
- `GET /api/user/profile` - Get user profile (authenticated)
- `PUT /api/user/profile` - Update user profile (authenticated)

### Rooms

- `POST /api/room/create` - Create a new room
- `POST /api/room/join` - Join an existing room
- `GET /api/room/:code` - Get room details
- `GET /api/room/user/:userId` - Get user's rooms

### Doodle/Drawing

- `POST /api/doodle` - Save drawing state
- `GET /api/doodle/:roomId` - Get room's drawing history
- `DELETE /api/doodle/:roomId` - Clear room's drawings

### Health Check

- `GET /api/health` - Server health status

## 🔌 Socket.IO Events

### Connection Events

- `join-room` - Join a video room
- `user-joined` - Notify when user joins
- `user-left` - Notify when user leaves
- `disconnect` - Handle user disconnect

### WebRTC Events

- `webrtc:offer` - Send WebRTC offer
- `webrtc:answer` - Send WebRTC answer
- `webrtc:ice-candidate` - Exchange ICE candidates

### Media Control Events

- `media-state-changed` - Toggle audio/video state
- `get-participants` - Get current room participants

### Drawing Events

- `doodle:start` - Start drawing stroke
- `doodle:draw` - Continue drawing stroke
- `doodle:end` - End drawing stroke
- `doodle:undo` - Undo last action
- `doodle:clear` - Clear the canvas
- `doodle:sync-request` - Request drawing sync
- `doodle:sync-response` - Receive drawing sync

## 🎨 Usage

### Creating a Room

1. Sign up or log in
2. Navigate to "Create Room"
3. Enter room details
4. Share the room code with participants

### Joining a Room

1. Sign up or log in
2. Navigate to "Join Room"
3. Enter the room code
4. Allow camera and microphone permissions

### Using the Whiteboard

1. Click the **Pen icon** to enable drawing mode
2. Select your preferred **color** from the color picker
3. Choose **stroke width** from the width picker
4. Draw on the canvas - changes sync in real-time
5. Use **Undo** to remove last stroke
6. Use **Clear** to reset the canvas
7. Click **Camera icon** to capture screenshot
8. Click **X icon** to disable drawing mode

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Helmet.js for security headers
- CORS configuration
- Input validation with express-validator
- Environment variable protection

## 🐛 Troubleshooting

### Common Issues

**Camera/Microphone not working:**

- Ensure browser has permissions for camera and microphone
- Check if other applications are using the camera
- Try using HTTPS (required for WebRTC in production)

**Connection issues:**

- Verify MongoDB is running
- Check if ports 3000 and 5000 are available
- Ensure CORS_ORIGIN is correctly configured

**Drawing not syncing:**

- Check Socket.IO connection status
- Verify room code is correct
- Check browser console for errors

## 📝 Development

### Code Structure

- Follow the existing folder structure
- Use TypeScript for type safety
- Follow React best practices and hooks patterns
- Use Redux for global state management
- Implement error handling in all async operations

### Important Production Settings

- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure proper `CORS_ORIGIN`
- Use MongoDB Atlas for database
- Enable HTTPS for WebRTC

---

**Built with ❤️ by Jay Zadafiya**
