# My Fullstack App

A modern fullstack application built with Next.js, Express, and Tailwind CSS.

## Tech Stack

- **Frontend**: Next.js 16 (App Router) with React 19
- **Backend**: Express.js with TypeScript
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript

## Project Structure

```
my-fullstack-app/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles with Tailwind
├── server/                # Express backend
│   ├── index.ts          # Express server entry point
│   └── tsconfig.json     # Server TypeScript config
├── public/               # Static assets
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone or navigate to the project directory
2. Install dependencies:

```bash
npm install
```

3. Copy the environment variables:

```bash
cp .env.example .env
```

### Development

Run both the frontend and backend in development mode:

1. Start the Express backend server (in one terminal):

```bash
npm run server
```

This starts the API server on `http://localhost:3001`

2. Start the Next.js development server (in another terminal):

```bash
npm run dev
```

This starts the frontend on `http://localhost:3000`

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Build

Build the Next.js application:

```bash
npm run build
npm start
```

Run the backend in production mode:

```bash
npm run server:prod
```

## Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build Next.js for production
- `npm start` - Start Next.js production server
- `npm run lint` - Run ESLint
- `npm run server` - Start Express backend with hot reload
- `npm run server:prod` - Start Express backend in production mode

## API Endpoints

The Express backend provides the following endpoints:

- `GET /api/hello` - Returns a welcome message
- `GET /api/data` - Returns sample data array
- `POST /api/echo` - Echoes back the message sent in request body

## Features

- Server-side rendering with Next.js App Router
- RESTful API with Express
- TypeScript for type safety
- Tailwind CSS for styling
- Hot reload for both frontend and backend
- Dark mode support
- CORS enabled for API requests

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Express Documentation](https://expressjs.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
