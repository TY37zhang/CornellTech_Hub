# Cornell Tech Hub

A student-built community platform for Cornell Tech students to collaboratively manage their academic journey. This independent project (not officially affiliated with Cornell Tech) provides course planning, peer reviews, and community engagement tools designed specifically for the Cornell Tech experience.

> **Note**: This platform is built by students, for students. It serves as a central hub for peer-to-peer resource sharing and academic collaboration within the Cornell Tech community.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Database Architecture](#database-architecture)
- [Development Workflow](#development-workflow)
- [Contributing](#contributing)

## Features

- **🎓 Course Catalog**: Browse 500+ Cornell Tech courses with peer reviews and ratings
- **📚 Academic Planner**: Program-specific course planning with requirement tracking and scheduling
- **💬 Community Forum**: Discussion platform with 7 specialized categories and threaded comments
- **👤 User Profiles**: Cornell email authentication with Google OAuth and profile customization
- **🛡️ Admin Dashboard**: Comprehensive administration with moderation, security monitoring, and analytics

## Getting Started

### Prerequisites

- **Node.js** (latest LTS version recommended)
- **PostgreSQL database** (local installation or cloud service like Neon)
- **Cornell email address** (@cornell.edu required for authentication)
- **Google Cloud Console project** (for OAuth setup)

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
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed with sample data
npx prisma db seed
```

5. Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Cornell Course Data

To populate the database with Cornell Tech course data:

```bash
# Navigate to the scraper directory
cd scraper

# Run the course scraper
./run_scraper.sh

# Update the database with scraped data
python3 scripts/update_database.py cornell_courses.json
```

## Project Structure

```
cornell-tech-hub/
├── app/                    # Next.js App Router directory
│   ├── admin/             # Comprehensive admin dashboard
│   │   ├── database/      # Database administration with live stats
│   │   ├── feedback/      # User feedback management system
│   │   ├── health/        # System health and performance monitoring
│   │   ├── moderation/    # Content moderation dashboard with audit trails
│   │   ├── security/      # Security event monitoring and threat detection
│   │   └── users/         # User role management and analytics
│   ├── api/               # Full-stack API routes
│   │   ├── admin/         # Admin-only API endpoints
│   │   ├── auth/          # NextAuth.js authentication
│   │   ├── courses/       # Course CRUD and search
│   │   ├── forum/         # Forum posts and comments
│   │   ├── planner/       # Academic planning data
│   │   ├── security/      # Security monitoring APIs
│   │   ├── user/          # User profile management
│   │   └── feedback/      # Contact and feedback handling
│   ├── auth/              # Sign-in and sign-up pages
│   ├── components/        # App-specific shared components
│   ├── courses/           # Course catalog and reviews
│   ├── forum/             # Community discussion system
│   ├── planner/           # Academic planning interface
│   ├── user/              # User profiles and activity
│   ├── my-reviews/        # Personal course reviews
│   ├── animated-cards/    # UI animation showcase
│   ├── faq/               # Help and documentation
│   ├── feedback/          # User feedback system
│   ├── contact/           # Contact form
│   ├── settings/          # User preferences
│   └── legal/             # Terms of service, privacy policy
├── components/            # Global reusable components
│   ├── admin/             # Admin-specific components
│   ├── ui/                # Radix UI styled components
│   └── providers/         # Context providers (session, theme, etc.)
├── hooks/                 # Custom React hooks
├── lib/                   # Core utilities and configurations
│   ├── auth.ts           # NextAuth.js configuration
│   ├── db.ts             # Database connection
│   ├── roles.ts          # User role management system
│   ├── error-handling.ts # Security-focused error handling
│   ├── validations/       # Zod schemas
│   └── services/          # Business logic
├── middleware/            # Request/response middleware
│   ├── rate-limit.ts     # Campus-scale rate limiting
│   └── validation.ts     # Request validation
├── prisma/                # Database schema and migrations
├── scraper/               # Cornell course data scraping tools
│   ├── scripts/           # Python scraping utilities
│   └── output/            # Scraped course data
├── scripts/               # Database migration and utility scripts
├── public/                # Static assets and media
└── styles/                # Global CSS and Tailwind config
```

## Environment Variables

Add the following keys to `.env.local`:

```env
# Database Configuration
DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DATABASE"

# Authentication (Google OAuth)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"

# Email Service (Resend)
RESEND_API_KEY="your-resend-api-key"
ADMIN_EMAIL="admin@yourdomain.com"
EMAIL_DOMAIN="yourdomain.com"

# Application Configuration
APP_URL="http://localhost:3000"
NODE_ENV="development"

# Analytics & Monitoring (Production)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="your-analytics-id"
VERCEL_URL="your-production-url"
```

## Database Architecture

```
PostgreSQL Database (35+ Tables)
│
├── 👤 User Management
│   ├── User (auth, profiles, roles)
│   ├── Account (OAuth providers)
│   ├── Session (active sessions)
│   └── VerificationToken
│
├── 📚 Academic System
│   ├── Course (catalog data)
│   ├── CourseCategory (departments)
│   ├── CourseReview (ratings, feedback)
│   ├── CoursePlanner (user plans)
│   ├── CourseSchedule (timetables)
│   └── SpecialRequirement (program rules)
│
├── 💬 Community Features
│   ├── ForumPost (discussions)
│   ├── ForumComment (nested threads)
│   ├── ForumCategory (topics)
│   ├── ForumLike (engagement)
│   ├── ForumView (analytics)
│   └── ForumSavedPost (bookmarks)
│
├── 🛡️ Moderation & Security
│   ├── ContentModeration (flags, reviews)
│   ├── UserReport (community reports)
│   ├── ModerationLog (audit trails)
│   ├── SecurityEvent (monitoring)
│   └── RateLimit (protection)
│
├── 📊 Analytics & Performance
│   ├── HotPostAlgorithm (trending)
│   ├── SearchCache (optimization)
│   ├── UserTokenUsage (tracking)
│   └── DatabaseMetrics (health)
│
└── 🔮 Future Features
    ├── ChatMessage (AI integration)
    ├── ChatConversation
    └── MarketplaceItem
```

## Development Workflow

### Scripts & Commands

```bash
# Development
npm run dev                 # Start development server
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint

# Database
npx prisma studio          # Open Prisma Studio (database GUI)
npx prisma migrate dev     # Create and apply migrations
npx prisma generate        # Generate Prisma client

# Analytics & Optimization
ANALYZE=true npm run build # Analyze bundle size
```

## Contributing

### Development Setup

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the development setup instructions above
4. Make your changes and test thoroughly
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Contribution Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Add proper type definitions
- Test authentication flows with Cornell email
- Ensure mobile responsiveness
- Update documentation as needed
