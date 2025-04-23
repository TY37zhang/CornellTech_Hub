# Cornell Tech Hub

A community platform for Cornell Tech students to share resources, discuss courses, and connect with peers.

## Features

-   Course reviews and ratings
-   Student forum for discussions
-   Marketplace for buying and selling items
-   Authentication with Google (Cornell email required)

## Getting Started

### Prerequisites

-   Node.js 18+ and npm
-   A Google Cloud Platform account for OAuth setup
-   A Neon database account for PostgreSQL

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Database
DATABASE_URL=your_neon_database_url

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Setting up Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add the following authorized redirect URIs:
    - `http://localhost:3000/api/auth/callback/google` (for development)
    - `https://your-production-domain.com/api/auth/callback/google` (for production)
7. Copy the Client ID and Client Secret to your `.env.local` file

### Database Setup

The application uses a Neon PostgreSQL database. You'll need to create the following tables:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  google_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## Authentication

The application uses NextAuth.js for authentication with the following providers:

-   Google OAuth (primary method)
-   Email/Password (legacy support)

For Google authentication, users must use their Cornell email address (@cornell.edu) to sign up. The application verifies this requirement during the sign-in process.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
