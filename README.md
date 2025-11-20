# MyAyu MVP

Health tracking application for patients and clinicians built with React, TypeScript, Vite, Tailwind CSS, and Supabase.

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router
- **Backend**: Supabase (PostgreSQL)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account and project

### Installation

1. Clone the repository and navigate to the project directory:

```bash
cd myayu-mvp
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Then edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can find these values in your Supabase project settings:
- Go to [https://app.supabase.com](https://app.supabase.com)
- Select your project
- Navigate to Settings → API
- Copy the Project URL and anon/public key

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173)

### Build

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── components/     # Shared UI components
│   └── Layout.tsx  # Main layout with navigation
├── lib/            # Utilities and configuration
│   └── supabaseClient.ts  # Supabase client setup
└── routes/         # Page components
    ├── PatientDailyEntryPage.tsx
    ├── PatientTrackerPage.tsx
    └── ClinicianTrackerPage.tsx
```

## Routes

- `/patient/daily` - Patient daily entry form
- `/patient/tracker` - Patient tracker with multiple lenses
- `/clinician/tracker/:patientId` - Clinician view (read-only)

## Development Notes

- The app uses Tailwind CSS v4 with the new `@theme` configuration syntax
- Environment variables must be prefixed with `VITE_` to be accessible in the client
- The Supabase client includes centralized error handling via `handleSupabaseError()`
