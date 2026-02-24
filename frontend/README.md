# Real Estate Dashboard - Frontend

Next.js React frontend for the Real Estate Dashboard.

## Features

- **People Directory**: Browse people in a responsive grid with pagination
- **Person Details**: View detailed information about each person including deals, organizations, and properties
- **Deal Details**: Display comprehensive deal information with associated parties and properties
- **Organization Details**: View organization information, members, deals, and properties
- **Property Details**: Display property details with images, specifications, and related entities

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The application will be available at `http://localhost:3000`

## Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Project Structure

```
src/
├── app/              # Next.js app directory
│   ├── page.tsx      # Home page with people list
│   ├── people/       # Person detail page
│   ├── deals/        # Deal detail page
│   ├── organizations/ # Organization detail page
│   └── properties/   # Property detail page
├── components/       # Reusable components
├── lib/
│   └── api.ts        # API client configuration
└── pages/            # API routes (if needed)
```

## Technology Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe code
- **Tailwind CSS**: Utility-first CSS styling
- **Axios**: HTTP client for API requests
- **React Icons**: Icon library
