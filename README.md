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
│   ├── api/               # API routes (forum, user, planner, etc.)
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
├── components/            # Global components (with ui/ and providers/)
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions, db/auth/prisma/email helpers, validations
├── middleware/            # Middleware logic (e.g., validation)
├── prisma/                # Database schema and migrations (if present)
├── public/                # Static assets
├── styles/                # Global styles
```

- **app/components/**: Shared components used within the app directory.
- **components/**: Global components, including UI primitives and providers.
- **middleware/**: Contains middleware logic, such as validation.
- **lib/**: Utility functions, database/auth/prisma/email helpers, and validations.
- **prisma/**: Database schema and migrations (ensure this directory exists if using Prisma).

Other directories such as `settings`, `user`, `my-reviews`, `reviews`, `animated-cards`, `coming-soon`, `faq`, `feedback`, `contact`, `terms-of-service`, and `privacy-policy` provide additional features and static/info pages.

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
