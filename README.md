# Cornell Tech Hub

A student-built community platform for Cornell Tech students to collaboratively manage their academic journey. This independent project (not officially affiliated with Cornell Tech) provides course planning, peer reviews, and community engagement tools designed specifically for the Cornell Tech experience.

> **Note**: This platform is built by students, for students. It serves as a central hub for peer-to-peer resource sharing and academic collaboration within the Cornell Tech community.

## Features

### 🎓 Course Management System

- **Comprehensive Catalog**: Browse 500+ Cornell Tech courses with detailed information
- **Advanced Search & Filtering**: Find courses by department, credits, semester, or keywords
- **Peer Reviews**: Multi-dimensional rating system (overall rating, difficulty, workload)
- **Professor Information**: View instructor assignments and course history
- **Department Organization**: Courses organized by CS, ECE, ORIE, INFO, TECH, and more

### 📚 Academic Planning Suite

- **Program-Specific Planning**: Tailored for all Cornell Tech programs:
    - **MEng**: Computer Science, Data Science, Electrical & Computer Engineering, Operations Research
    - **MS**: Design Technology, Information Systems (3 specialized tracks)
    - **MBA**: Johnson Cornell Tech
    - **LLM**: Law, Technology & Entrepreneurship
- **Intelligent Requirement Tracking**: Automatic progress monitoring for degree requirements
- **Credit Management**: Real-time credit counting and validation
- **Interactive Scheduling**: Weekly timetable with drag-and-drop course planning
- **Demo Mode**: Full functionality without login using sample data
- **Auto-Save**: Persistent data storage for authenticated users, localStorage for demo users

### 💬 Community Forum

- **Organized Discussions**: 7 specialized categories (Academics, Campus Life, Career, Events, General, Housing, Technology)
- **Threaded Comments**: Nested comment system with upvote/downvote functionality
- **Rich Post Management**: Create, edit, save posts with markdown support
- **Engagement Tracking**: Like system, view analytics, and notification preferences
- **Advanced Search**: Find discussions by keywords, categories, and user activity

### 🔐 Authentication & User Profiles

- **Cornell Email Restriction**: Exclusive access for @cornell.edu email addresses
- **Google OAuth Integration**: Seamless sign-in with Cornell Google accounts
- **Program Association**: Links users to their specific Cornell Tech program
- **Profile Customization**: Avatar upload via Cloudinary, program selection, personal settings

### ✨ Advanced UI & Experience

- **Animated Components**: Sophisticated motion design with Framer Motion
- **Interactive Demos**: Showcase page for advanced animation patterns
- **Responsive Design**: Mobile-first approach with collapsible navigation
- **Loading Optimization**: Skeleton screens and progressive loading states
- **Accessibility**: ARIA labels and keyboard navigation support

### 🛡️ Administration & Security

- **Comprehensive Admin Dashboard**: Real-time statistics, system health monitoring, and user analytics
- **Advanced User Management**: Role-based access control with Student/Faculty/Staff/Admin/Moderator roles
- **Content Moderation System**: Complete moderation workflow with flagging, hiding, deletion, and audit trails
- **Security Monitoring**: Real-time security event tracking, rate limiting, and IP-based suspicious activity detection
- **Report Management**: User reporting system with admin review workflow and content moderation
- **Database Administration**: Performance metrics, connection monitoring, and health checks
- **Rate Limiting**: Campus-scale rate limiting (800+ users) with endpoint-specific configurations

### 🛠️ Support & Information

- **FAQ System**: Comprehensive help with accordion-style organization
- **Contact System**: Direct communication with platform maintainers
- **Feedback Collection**: User suggestions and bug reporting system
- **Legal Compliance**: Privacy policy and terms of service

## Tech Stack

### Frontend

- **Next.js 15.3.1** - React framework with App Router
- **React 18.3.1** - UI library with concurrent features
- **TypeScript** - Type safety and enhanced developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI primitives
- **Framer Motion** - Advanced animations and transitions
- **DnD Kit** - Drag-and-drop interactions for course planning
- **Lucide React** - Beautiful, customizable icons
- **React Hook Form** - Performant form management
- **Zod** - Schema validation for type safety
- **Sonner** - Modern toast notifications
- **Class Variance Authority** - Component styling utilities

### Backend & Infrastructure

- **Next.js API Routes** - Full-stack API with Edge runtime support
- **Prisma ORM** - Type-safe database client with migrations
- **PostgreSQL** - Production database (local or Neon serverless)
- **NextAuth.js** - Secure authentication with Google OAuth
- **Cloudinary** - Image upload and optimization
- **Resend** - Transactional email service
- **Vercel** - Deployment platform with analytics

### Development & Optimization

- **ESLint** - Code linting and formatting
- **TypeScript** - Static type checking
- **Next Bundle Analyzer** - Bundle size optimization
- **Vercel Analytics** - Performance monitoring
- **Vercel Speed Insights** - Core Web Vitals tracking
- **Next Sitemap** - SEO optimization
- **PostCSS** - CSS processing and optimization

## Getting Started

### Prerequisites

- **Node.js** (latest LTS version recommended)
- **PostgreSQL database** (local installation or cloud service like Neon)
- **Cornell email address** (@cornell.edu required for authentication)
- **Google Cloud Console project** (for OAuth setup)
- **Environment variables** (see configuration section below)

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

For detailed scraper documentation, see [scraper/README.md](scraper/README.md).

## Architecture & Design

### Application Architecture

- **Full-Stack**: Next.js with App Router for both frontend and API
- **Database**: PostgreSQL with Prisma ORM for type safety
- **Authentication**: NextAuth.js with Google OAuth provider
- **File Storage**: Cloudinary for avatar and media uploads
- **Deployment**: Vercel with analytics and performance monitoring

### Design Principles

- **Student-Centric**: Designed specifically for Cornell Tech workflows
- **Performance-First**: Optimized loading, caching, and bundle size
- **Accessibility**: WCAG compliant with proper ARIA labels
- **Mobile-Responsive**: Touch-friendly interface for all devices
- **Type Safety**: Full TypeScript coverage with Zod validation

## Project Structure

```
cornell-tech-hub/
├── app/                    # Next.js App Router directory
│   ├── admin/             # Admin dashboard and management interface
│   │   ├── database/      # Database administration and stats
│   │   ├── feedback/      # Admin feedback management
│   │   ├── health/        # System health monitoring
│   │   ├── moderation/    # Content moderation dashboard
│   │   ├── security/      # Security event monitoring
│   │   └── users/         # User role management
│   ├── api/               # Full-stack API routes
│   │   ├── admin/         # Admin-only API endpoints
│   │   │   ├── moderation/ # Content moderation APIs
│   │   │   ├── reports/   # User report management
│   │   │   └── users/     # User management APIs
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

- **app/components/**: Shared components used within the app directory.
- **components/**: Global components, including UI primitives and providers.
- **middleware/**: Contains middleware logic, such as validation.
- **lib/**: Utility functions, database/auth/prisma/email helpers, and validations.
- **prisma/**: Database schema and migrations (ensure this directory exists if using Prisma).
- **db-info/**: Supplemental database documentation or ER diagrams.
- **misc/**: Miscellaneous scripts, experiments, or one-off utilities.

### Key Directories Explained

- **app/api/**: RESTful API endpoints with Next.js App Router
- **app/admin/**: Comprehensive admin dashboard with user management, moderation, security monitoring
- **app/planner/**: Interactive course planning with drag-and-drop
- **app/forum/**: Community discussion system with categories
- **app/courses/**: Course catalog, search, and review system
- **components/ui/**: Radix UI components styled with Tailwind CSS
- **lib/**: Core utilities including auth, database, validation, and role management
- **middleware/**: Rate limiting, request validation, and security middleware
- **scraper/**: Python tools for importing Cornell course data
- **prisma/**: Database schema with comprehensive academic models

## Environment Variables

Add the following keys to `.env.local` (values shown are examples):

```env
# Database Configuration
DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DATABASE"

# Authentication (Google OAuth)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_URL="http://localhost:3000"     # Your application URL
NEXTAUTH_SECRET="your-nextauth-secret"   # Random string for JWT signing

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"

# Email Service (Resend)
RESEND_API_KEY="your-resend-api-key"
ADMIN_EMAIL="admin@yourdomain.com"       # Receives contact & feedback emails
EMAIL_DOMAIN="yourdomain.com"            # Optional — custom sending domain

# Application Configuration
APP_URL="http://localhost:3000"          # Base URL of the application
NODE_ENV="development"                   # Environment mode

# Analytics & Monitoring (Production)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="your-analytics-id"  # Optional
VERCEL_URL="your-production-url"                     # Auto-set by Vercel
```

> **Important**:
>
> - For Google OAuth, add your domain to authorized origins in Google Console
> - For production deployment on Vercel, set these variables in project settings
> - The `NEXTAUTH_SECRET` should be a random 32+ character string
> - Cornell email restriction is enforced at the application level

## Database Architecture

The application uses a PostgreSQL database with Prisma ORM, featuring a comprehensive schema designed for academic planning and community engagement:

### Core Entities

- **Users**: Authentication, profiles, program associations
- **Courses**: Complete Cornell Tech catalog with metadata
- **Course Reviews**: Multi-dimensional rating system
- **Course Planner**: User-specific academic planning and progress tracking
- **Course Schedules**: Weekly timetable management
- **Course Categories**: Department and subject organization

### Community Features

- **Forum Posts**: Discussion threads with categorization
- **Forum Comments**: Nested comment system with voting
- **Forum Categories**: Organized discussion topics
- **Forum Likes & Views**: Engagement tracking
- **Forum Saved Posts**: User bookmarking system
- **Content Moderation**: Comprehensive moderation system with flagging, review, and resolution workflows
- **User Reporting**: Community-driven content reporting with admin review process

### Administrative Features

- **User Role Management**: Student/Faculty/Staff roles with Admin/Moderator elevation system
- **Content Moderation Dashboard**: Complete moderation interface with audit trails
- **Security Event Monitoring**: Real-time tracking of authentication failures, rate limiting, and suspicious activity
- **Database Administration**: Performance monitoring, connection management, and health checks
- **Report Processing**: Structured workflow for handling user reports and content violations
- **Feedback Management**: Admin interface for processing user suggestions and bug reports

### Advanced Features

- **Search Cache**: Optimized search performance
- **User Token Usage**: Analytics and usage tracking
- **Rate Limiting**: Campus-scale protection with endpoint-specific configurations
- **Security Logging**: Comprehensive audit trails for all administrative and moderation actions
- **Special Requirements**: Custom academic requirement handling

### Data Relationships

- Users can create multiple course plans and reviews
- Courses support many-to-many relationships with categories
- Forum posts support nested comments with voting
- Comprehensive indexing for performance optimization

## Usage Guidelines

### Authentication & Authorization

- **Cornell Email Only**: Users must sign in with a @cornell.edu email address
- **Google OAuth**: Authentication is handled through Cornell's Google Workspace
- **Program Association**: Users select their Cornell Tech program during onboarding
- **Role-Based Access**: Student/Faculty/Staff roles with Admin/Moderator elevation capabilities
- **Route Protection**: Middleware-enforced access control for admin and moderation features

### Academic Programs Supported

- **Master of Engineering (MEng)**:
    - Computer Science
    - Data Science
    - Electrical & Computer Engineering
    - Operations Research & Information Engineering
- **Master of Science (MS)**:
    - Design Technology
    - Information Systems (3 specialized tracks)
- **Master of Business Administration (MBA)**:
    - Johnson Cornell Tech
- **Master of Laws (LLM)**:
    - Law, Technology & Entrepreneurship

### Key Features Usage

1. **Course Planning**: Build your academic plan with drag-and-drop scheduling
2. **Course Reviews**: Share detailed course experiences with ratings
3. **Forum Discussions**: Engage in program-specific and general discussions
4. **Demo Mode**: Try the planner without logging in using sample data
5. **Community Moderation**: Report inappropriate content and participate in community governance
6. **Admin Dashboard**: Access comprehensive administration tools (Admin/Moderator roles only)

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
npm run compress-assets    # Compress static assets
```

### Performance Monitoring

The application includes several performance optimization features:

- **Vercel Analytics**: Real-time performance monitoring
- **Speed Insights**: Core Web Vitals tracking
- **Bundle Analyzer**: Bundle size optimization
- **Search Caching**: Optimized search performance
- **Image Optimization**: Cloudinary integration with Next.js Image

## Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Configure all required environment variables
3. **Database**: Ensure your PostgreSQL database is accessible
4. **Domain Setup**: Configure custom domain if needed

### Environment-Specific Configuration

- **Development**: Uses local database and `localhost:3000`
- **Preview**: Vercel preview deployments with preview database
- **Production**: Production database with custom domain

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

## Community & Support

### Getting Help

- **Issues**: Report bugs or feature requests via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Contact**: Use the in-app contact form for direct communication

### Project Status

- **Maintenance**: Actively maintained by Cornell Tech students
- **Independent**: Not officially affiliated with Cornell Tech
- **Community-Driven**: Built by students, for students
