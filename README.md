# Cornell Tech Hub

A comprehensive platform for Cornell Tech students to manage their academic journey, including course planning, reviews, and community engagement.

## Features

### Course Management

- Course catalog with detailed information
- Course reviews and ratings
- Course planning and scheduling
- Course categories and filtering

### Academic Planning

- Course planner with semester-by-semester planning
- Schedule management with day/time organization
- Requirement tracking
- Notes and status tracking for planned courses

### Community Features

- Forum system with categories
- Post and comment functionality
- Like and view tracking
- Saved posts and notifications
- Tag system for better organization

### User Management

- User profiles with program information
- Avatar support
- Authentication system
- Personalized settings

### Marketplace

- Item listings
- User-to-user transactions

## Tech Stack

### Frontend

- Next.js 15.3.1
- React 18.3.1
- TypeScript
- Tailwind CSS
- Radix UI components
- Framer Motion for animations
- React Hook Form for form management
- Zod for validation

### Backend

- Next.js API routes
- Prisma ORM
- PostgreSQL database
- NextAuth.js for authentication
- Cloudinary for media storage
- Resend for email functionality

### Development Tools

- ESLint for code linting
- TypeScript for type safety
- PostCSS for CSS processing
- Tailwind CSS for styling

## Getting Started

### Prerequisites

- Node.js (latest LTS version)
- PostgreSQL database
- Environment variables (see `.env.example`)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/cornell-tech-hub.git
cd cornell-tech-hub
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration values.

4. Set up the database:

```bash
npx prisma migrate dev
```

5. Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
cornell-tech-hub/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── components/        # Shared components
│   ├── courses/           # Course-related pages
│   ├── forum/             # Forum pages
│   ├── marketplace/       # Marketplace pages
│   ├── planner/           # Course planner pages
│   ├── reviews/           # Review pages
│   └── user/              # User-related pages
├── components/            # Global components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── prisma/                # Database schema and migrations
├── public/                # Static assets
└── styles/                # Global styles
```

## Database Schema

The application uses a PostgreSQL database with the following main entities:

- Users
- Courses
- Course Reviews
- Course Schedules
- Course Planners
- Forum Posts
- Forum Comments
- Forum Categories
- Marketplace Items

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Cornell Tech for providing the course data
- All contributors who have helped build this platform
