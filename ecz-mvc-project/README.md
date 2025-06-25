# ecz-mvc-project

## Overview
The ecz-mvc-project is a full-stack application that utilizes React for the frontend and Node.js with Express for the backend. The application is designed to interact with an SQLite database named `ecz_db_1.4.db`.

## Project Structure
The project is organized into two main directories: `backend` and `frontend`.

### Backend
- **src/app.js**: Entry point for the backend application. Initializes the Express app and sets up middleware.
- **src/controllers/index.js**: Contains controller functions for handling requests and responses.
- **src/models/index.js**: Defines data models and functions to interact with the SQLite database.
- **src/routes/index.js**: Sets up API routes and connects them to controller functions.
- **src/views/index.js**: Formats data for responses, including JSON and HTML views.
- **db/ecz_db_1.4.db**: The SQLite database used by the backend.
- **package.json**: Lists backend dependencies and scripts.
- **README.md**: Documentation for the backend setup and API usage.

### Frontend
- **src/index.js**: Entry point for the React application. Renders the main component into the DOM.
- **src/components/App.jsx**: Main React component that includes routing and layout.
- **src/controllers/index.js**: Functions for interacting with the backend API.
- **src/models/index.js**: Data models for the frontend application.
- **src/views/Home.jsx**: React component representing the home view.
- **package.json**: Lists frontend dependencies and scripts.
- **README.md**: Documentation for the frontend setup and usage.

## Setup Instructions

### Backend
1. Navigate to the `backend` directory.
2. Install dependencies using:
   ```
   npm install
   ```
3. Start the backend server with:
   ```
   npm start
   ```

### Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies using:
   ```
   npm install
   ```
3. Start the frontend application with:
   ```
   npm start
   ```

## API Usage
The backend provides a RESTful API for CRUD operations. Refer to the backend README for detailed API endpoints and usage instructions.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.