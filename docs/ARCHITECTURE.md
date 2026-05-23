# Architecture Documentation

## Overview

This application follows a modular, scalable architecture using Next.js App Router with TypeScript.

## Directory Structure

### `/src/app`
Next.js App Router structure with route groups:
- `(auth)` - Authentication pages (login, signup)
- `(dashboard)` - Protected dashboard routes

### `/src/components`
- **layout/** - Shell components (Sidebar, Header)
- **ui/** - Reusable UI primitives following shadcn/ui patterns
- **shared/** - Application-specific shared components

### `/src/store`
Zustand stores for state management:
- `auth-store.ts` - Authentication state
- `transaction-store.ts` - Transaction data and filters
- `workspace-store.ts` - Workspace management
- `ui-store.ts` - UI preferences (theme, sidebar)

### `/src/types`
TypeScript type definitions:
- `models.ts` - Domain models (User, Transaction, Budget, etc.)
- `enums.ts` - TypeScript enums for business logic
- `index.ts` - Type exports

### `/src/schemas`
Zod validation schemas for form validation and API data validation.

### `/src/providers`
React context providers:
- `ThemeProvider` - Dark/light theme management
- `AuthProvider` - Authentication context
- `QueryProvider` - React Query client

### `/src/lib`
Utility functions and helpers.

### `/src/config`
Application configuration constants.

## State Management

Using Zustand with persistence middleware for:
- User authentication state
- Transaction data with filters and pagination
- Workspace management
- UI preferences (theme, sidebar state)

## Theme System

CSS variables defined in `globals.css` with dark mode support:
- `--primary`, `--primary-foreground`
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- All Radix-style semantic tokens

Theme provider handles:
- System preference detection
- Manual theme switching
- CSS class application

## Routing

```
/                     -> Redirects to /dashboard
/login               -> Login page (unauthenticated)
/signup              -> Signup page (unauthenticated)
/dashboard           -> Dashboard (authenticated)
  /transactions      -> Transactions list
  /budgets          -> Budget management
  /workspaces       -> Workspace management
  /settings         -> User settings
```

## Future Integrations

- Supabase for authentication and database
- API routes for backend logic
- Real-time subscriptions
- File uploads for receipts