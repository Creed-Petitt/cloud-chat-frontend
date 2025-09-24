# CloudChat - AI Chat Frontend (Reference Client)

This React application is the official reference client for the **[CloudChat AI Services Backend](https://github.com/Creed-Petitt/cloud-chat-backend)**.

Its primary purpose is to provide a production-ready demonstration of the backend's full capabilities, including multi-provider LLM streaming, stateful conversation management, JWT-based security, and real-time API communication. The application showcases how a modern web client can seamlessly consume the unified AI gateway to deliver a rich user experience.

## Key Backend Integration Features

- **Unified AI API Consumption**: Demonstrates the backend's multi-provider architecture by allowing users to switch between AI models seamlessly
- **JWT Authentication Flow**: Implements Firebase authentication with secure token-based communication to the Spring Boot backend
- **Conversation Persistence**: Showcases the backend's database integration through full conversation history management
- **Rate Limiting Visualization**: Displays remaining request counts, demonstrating the backend's rate limiting implementation
- **Real-time Error Handling**: Provides user feedback for backend errors, timeouts, and authentication issues

## Architecture Integration

The frontend communicates with the backend through a well-defined REST API, showcasing modern full-stack development patterns:

### Authentication Flow
- **Firebase JWT Integration**: Users authenticate via Google or GitHub OAuth
- **Token Management**: Automatic token refresh and secure header injection for all API calls
- **Backend Validation**: Each request is validated by the Spring Boot backend's Firebase security filter

### API Communication
- **RESTful Endpoints**: Consumes the backend's `/api/conversations` and `/api/images` endpoints
- **Error Handling**: Implements comprehensive error handling for network issues, authentication failures, and backend errors
- **Request/Response Patterns**: Demonstrates proper API consumption with loading states and user feedback

### Data Management
- **Conversation State**: Manages conversation and message state synchronized with the backend database
- **Model Selection**: Dynamic switching between AI providers through the backend's factory pattern
- **Persistent History**: Loads and displays conversation history from the PostgreSQL database via the backend API

## Technology Stack

- **Frontend**: React 19.1.1 with Vite build system
- **Authentication**: Firebase Auth with Google and GitHub providers
- **HTTP Client**: Axios for RESTful API communication
- **Deployment**: Vercel with environment-based configuration
- **Backend Integration**: Spring Boot REST API with PostgreSQL persistence

## API Endpoints Consumed

The application demonstrates consumption of the following backend endpoints:

- **`POST /api/conversations/{id}/messages`**: Send messages to AI models
- **`GET /api/conversations`**: Retrieve user conversation history
- **`GET /api/conversations/{id}`**: Load specific conversation with messages
- **`DELETE /api/conversations/{id}`**: Remove conversations and cleanup

## Configuration

The application requires environment variables to connect to the backend and Firebase:

```env
# Backend API
VITE_API_BASE_URL=your-backend-url

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

The application is configured for deployment on Vercel with automatic builds and environment variable injection. The `vercel.json` configuration ensures proper SPA routing support.

## Project Structure

```
src/
├── components/          # UI components
├── context/            # React Context providers
│   ├── AuthContext.jsx    # Firebase authentication management
│   └── ContextProvider.jsx # API communication and state
├── lib/                # External service configuration
│   └── firebase.js        # Firebase initialization
└── utils/              # Helper functions
    └── textFormatter.js   # Response formatting utilities
```

## Backend Repository

This frontend is designed to work with the AI Services Backend. For complete documentation of the backend architecture, deployment, and API specifications, see the [backend repository](https://github.com/Creed-Petitt/cloud-chat-backend).

## Demo

The application demonstrates:
- Seamless switching between multiple AI providers
- Persistent conversation history across sessions
- Secure authentication and authorization
- Real-time interaction with AI models
- Error handling and user feedback
- Rate limiting and usage tracking

This frontend serves as a comprehensive example of how to build modern web applications that consume complex backend services while maintaining security, performance, and user experience standards.