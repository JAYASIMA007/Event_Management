# Event Management System

This project is an **Event Management System** that allows users and admins to manage events efficiently. It is built using **Django** for the backend, **React + Vite.js** for the frontend, and **MongoDB** as the database.

## Features

### Admin Features
- **Admin Registration & Login**:
  - Admins can register and log in securely using JWT-based authentication.
  - Password validation includes checks for strength (length, uppercase, lowercase, numbers, special characters).
  - Accounts are locked after 3 failed login attempts to prevent brute force attacks.

- **Event Management**:
  - Admins can create events with details such as title, venue, start and end dates/times, cost, and description.
  - Option to auto-generate event descriptions using Google's Gemini AI.
  - Validates uploaded image formats (JPEG, PNG, GIF).
  - Stores images in Base64 format for easy rendering.

- **Event Listings**:
  - Retrieves a list of all active events.

### User Features
- **User Registration & Login**:
  - Users can register and log in with strong password validation and JWT-based authentication.

- **Event Listings**:
  - Users can view a list of all active events.

### Common Features
- **JWT Authentication**:
  - Secure user and admin authentication using JSON Web Tokens.
  - Tokens include email, role, and user ID.

- **Account Locking**:
  - Accounts are locked after 3 failed login attempts for both admins and users.

## Tech Stack

### Backend
- **Django**:
  - RESTful API using Django views and decorators.
  - CSRF protection and error handling.
- **MongoDB**:
  - Used to store data for admins, users, and events.
  - Collections:
    - `admins`
    - `users`
    - `events`

### Frontend
- **React**:
  - Built with modern UI components.
- **Vite.js**:
  - Used for faster build processes and development.

## Installation

### Backend
1. Clone the repository:
   ```bash
   git clone https://github.com/JAYASIMA007/Event_Management.git
   cd Event_Management/backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   python manage.py runserver
   ```

### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd Event_Management/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend
- `MONGO_URI`: MongoDB connection string.
- `SECRET_KEY`: Django secret key.
- `GOOGLE_API_KEY`: API key for Google's Gemini AI.

### Frontend
- `VITE_API_URL`: Backend API URL for API requests.

## Deployment
The deployment link of the project is https://event-management-jayasima.vercel.app/

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing
Feel free to contribute to this project by opening issues and submitting pull requests.

## Contact
- **GitHub**: [JAYASIMA007](https://github.com/JAYASIMA007)
