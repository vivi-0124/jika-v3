# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Jika v3" (時間割 v3), a Japanese university course schedule management web application. It allows students to search courses, build timetables, track credits, and manage their academic schedules.

## Development Commands

```bash
# Development
pnpm dev                    # Start development server with Turbopack
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # Run ESLint

# Database (Drizzle ORM + Supabase)
pnpm db:generate           # Generate migration files from schema changes
pnpm db:migrate            # Apply migrations to database
pnpm db:push               # Push schema changes directly (development)
pnpm db:studio             # Open Drizzle Studio for database management

# Testing (Playwright E2E)
pnpm test                  # Run all E2E tests
pnpm test:ui               # Run tests with Playwright UI
pnpm test:headed           # Run tests in headed mode (visible browser)

# Utilities
pnpm create-test-user      # Create test user for development
```

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15 App Router, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Radix UI components
- **Database**: PostgreSQL with Drizzle ORM, hosted on Supabase
- **Authentication**: Supabase Auth with context providers
- **Testing**: Playwright for E2E tests

### Key Architecture Patterns

#### Database Layer (`src/db/`)
- **Schema**: Single file (`schema.ts`) defines all tables using Drizzle
- **Core Tables**: `lectures`, `userSchedules`, `groups`, `groupMembers`
- **Lecture Model**: Comprehensive fields for Japanese university system (multiple department targets, remote class flags, etc.)

#### Authentication & Context (`src/contexts/`)
- **AuthContext**: Manages Supabase auth state, session handling
- **UserContext**: Manages user-specific data including schedule
- **Test Mode**: Supports mock authentication for testing via window flags

#### Server Actions Pattern
- **No API Routes**: Uses Next.js Server Actions instead of traditional API routes
- **Actions Location**: Server actions are co-located with components or in dedicated action files
- **Database Operations**: Direct database access through Server Actions using Drizzle

#### Component Architecture (`src/components/`)
- **Main Layout**: Tab-based interface with bottom navigation
- **Core Components**: `LectureSearch`, `ScheduleView`, `LectureList`
- **UI Components**: Complete Radix UI component library in `ui/`
- **Special Effects**: Aurora background using Three.js and React Three Fiber

#### Data Flow
1. **Authentication**: AuthContext → UserContext → AuthGuard → Protected Routes
2. **Schedule Management**: User selects courses → Server Actions → Database → UserContext → UI Updates
3. **Search**: LectureSearch → Server Actions → Database Query → Results Display

### Environment Setup

Required environment variables in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

### Database Schema Considerations

The `lectures` table is designed for the Japanese university system:
- Multiple department target fields (`targetIntlStudies`, `targetIntlCulture`, etc.)
- Japanese academic terms (`term: '2024前期'`)
- Day of week in Japanese (`dayOfWeek: '月'`)
- Remote class classification (`isRemoteClass`)
- Part-time lecturer flag (`isPartTimeLecturer`)

### Testing Strategy

- **E2E Focus**: Primary testing through Playwright
- **Test Coverage**: Authentication flows, database operations, server actions, CRUD operations
- **Mock Support**: Test mode authentication bypass in AuthContext
- **Test User Creation**: Utility script for creating test data

### Recent Migration

The codebase recently migrated from API routes to Server Actions:
- All API endpoints in `src/app/api/` have been removed
- Database operations now use Server Actions for better performance and type safety
- Components directly call Server Actions instead of fetch operations

### Development Notes

- Uses PNPM as package manager
- Turbopack enabled for faster development builds
- Modern React patterns with hooks and context
- TypeScript strict mode enabled
- Component-first architecture with reusable UI library