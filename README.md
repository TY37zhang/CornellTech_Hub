# Cornell Tech Hub

A student-built community platform for Cornell Tech, featuring a course catalog with peer reviews, an academic planner, and a discussion forum.

> Not officially affiliated with Cornell Tech.

## Stack

Next.js · TypeScript · Tailwind CSS · Prisma · PostgreSQL · NextAuth.js

## Getting Started

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local   # then fill in values

# Set up the database
npx prisma generate
npx prisma db push

# Start the dev server
npm run dev
```

App runs at `http://localhost:3000`.

## Environment Variables

Create a `.env.local` with:

```env
DATABASE_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
ADMIN_EMAIL=
EMAIL_DOMAIN=
APP_URL=
```

## Scripts

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run start     # Run production build
npm run lint      # Lint
```

## License

See [LICENSE](./LICENSE).