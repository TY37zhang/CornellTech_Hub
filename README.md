# Cornell Tech Hub

A comprehensive platform for Cornell Tech students to manage their academic journey, including course planning, reviews, and community engagement.

## Features

### Course Management

- Course catalog with detailed information
- Course reviews and ratings
- Course planning and scheduling
- Course categories and filtering
- Advanced search functionality

### Academic Planning

- Interactive course planner with drag-and-drop functionality
- Schedule management with day/time organization
- Requirement tracking
- Notes and status tracking for planned courses
- Visual semester-by-semester planning

### Community Features

- Forum system with categories
- Post and comment functionality
- Like and view tracking
- Saved posts and notifications
- Tag system for better organization
- User reputation system

### User Management

- User profiles with program information
- Avatar support with Cloudinary integration
- Authentication system with NextAuth.js
- Personalized settings
- Email notifications via Resend

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Radix UI components
- Framer Motion for animations
- React Hook Form for form management
- Zod for validation
- DND Kit for drag-and-drop functionality
- Sonner for toast notifications

### Backend

- Next.js API routes
- Neon Database (PostgreSQL)
- NextAuth.js for authentication
- Cloudinary for media storage
- Resend for email functionality
- bcryptjs for password hashing

### Development Tools

- ESLint for code linting
- TypeScript for type safety
- PostCSS for CSS processing
- Tailwind CSS for styling
- next-sitemap for SEO optimization
- Vercel Analytics and Speed Insights

## Getting Started

### Prerequisites

- Node.js (latest LTS version)
- Neon Database account
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

```plaintext
cornell-tech-hub/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── components/        # Shared app-level components
│   ├── courses/           # Course-related pages
│   ├── forum/             # Forum pages
│   ├── planner/           # Course planner pages
│   ├── settings/          # User settings page
│   ├── user/              # User profile and posts
│   ├── my-reviews/        # User's own reviews
│   ├── reviews/           # Review details
│   ├── animated-cards/    # Animated cards demo/feature
│   ├── coming-soon/       # Placeholder page
│   ├── faq/               # Frequently asked questions
│   ├── feedback/          # Feedback form/page
│   ├── contact/           # Contact form/page
│   ├── terms-of-service/  # Terms of service
│   ├── privacy-policy/    # Privacy policy
│   └── search-test/       # Search functionality testing
├── components/            # Global components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and helpers
├── middleware/            # Middleware logic
├── public/                # Static assets
├── styles/                # Global styles
└── db-info/              # Database related files
```

## Database Schema

The application uses Neon Database (PostgreSQL) with the following main entities:

- Users
- Courses
- Course Reviews
- Course Schedules
- Course Planners
- Forum Posts
- Forum Comments
- Forum Categories
- User Settings
- Notifications

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
