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
- Radix UI primitives
- Framer Motion for animations
- DnD Kit for drag-and-drop interactions
- Lucide React for iconography
- Styled-components for styled helpers
- Sonner for toast notifications
- React Hook Form for form management
- Zod for validation

### Backend

- Next.js API routes
- Prisma ORM
- PostgreSQL (local or Neon serverless)
- NextAuth.js for authentication
- Cloudinary for media storage
- Resend for transactional email

### Development Tools

- ESLint for code linting
- TypeScript for type safety
- PostCSS for CSS processing
- Tailwind CSS for styling

## Getting Started

### Prerequisites

- Node.js (latest LTS version)
- PostgreSQL database
- Environment variables (see **Environment Variables** section below)

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

Create a `.env.local` file in the project root and populate it with the variables listed in the **Environment Variables** section below.

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
├── db-info/               # Database ER diagrams / docs
├── misc/                  # Miscellaneous scripts and utilities
```

- **app/components/**: Shared components used within the app directory.
- **components/**: Global components, including UI primitives and providers.
- **middleware/**: Contains middleware logic, such as validation.
- **lib/**: Utility functions, database/auth/prisma/email helpers, and validations.
- **prisma/**: Database schema and migrations (ensure this directory exists if using Prisma).
- **db-info/**: Supplemental database documentation or ER diagrams.
- **misc/**: Miscellaneous scripts, experiments, or one-off utilities.

Other directories such as `settings`, `user`, `my-reviews`, `reviews`, `animated-cards`, `coming-soon`, `faq`, `feedback`, `contact`, `terms-of-service`, and `privacy-policy` provide additional features and static/info pages.

## Environment Variables

Add the following keys to `.env.local` (values shown are examples):

```env
# Database
DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DATABASE"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"

# Resend Email
RESEND_API_KEY="your-resend-api-key"
ADMIN_EMAIL="admin@yourdomain.com"      # Receives contact & feedback emails
EMAIL_DOMAIN="yourdomain.com"            # Optional — custom sending domain

# Application
APP_URL="http://localhost:3000"          # Base URL of the application
```

> **Tip**: If you deploy to Vercel, set these variables in the project settings.

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
