# Finance Tracker

A modern, scalable finance tracking application built with Next.js, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Validation**: Zod
- **UI Components**: Radix UI primitives + shadcn/ui patterns
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, signup)
│   ├── (dashboard)/       # Authenticated dashboard routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Root page (redirects)
├── components/
│   ├── layout/            # Layout components (Sidebar, Header)
│   ├── shared/            # Shared components
│   └── ui/                # UI primitives (Button, Card, etc.)
├── config/                # App configuration
├── database/              # Database schemas and utilities
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── providers/             # React context providers
├── schemas/               # Zod validation schemas
├── services/              # API service layers
├── store/                 # Zustand state stores
├── supabase/              # Supabase client and types
└── types/                 # TypeScript type definitions
```

## Features

- **Dashboard**: Financial overview with stats and charts
- **Transactions**: Manage income and expenses
- **Budgets**: Track spending limits by category
- **Workspaces**: Multi-user workspace support
- **Settings**: User preferences and account management
- **Dark/Light Theme**: System-aware theme switching

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

## License

MIT