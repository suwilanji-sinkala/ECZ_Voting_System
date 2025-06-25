# Backend MVC Project Documentation

## Overview
This is the backend part of the MVC project built using Node.js and Express. It interacts with an SQLite database named `ecz_db_1.4.db` to perform CRUD operations.

## Project Structure
- **src/**: Contains the source code for the backend application.
  - **controllers/**: Contains the logic for handling requests and responses.
  - **models/**: Defines the data models and database interactions.
  - **routes/**: Sets up the API endpoints.
  - **views/**: Formats the data for responses.
  - **db/**: Contains the SQLite database file.
  - **app.js**: Entry point of the application.

## Setup Instructions
1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd ecz-mvc-project/backend
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Run the application**:
   ```
   npm start
   ```

## API Usage
- **GET /api/items**: Fetch all items.
- **POST /api/items**: Create a new item.
- **PUT /api/items/:id**: Update an existing item.
- **DELETE /api/items/:id**: Delete an item.

## Database
The application uses an SQLite database located in the `src/db/` directory. Ensure that the database file `ecz_db_1.4.db` is present before running the application.

## Contributing
Feel free to submit issues or pull requests for improvements or bug fixes.