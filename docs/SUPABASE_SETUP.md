# Database & Authentication Setup Guide

This document explains how to set up Supabase (for authentication) and Prisma (for database access) with TaxEngine.

## Architecture

- **Supabase Auth**: Handles user authentication (email/password, Google, Microsoft SSO)
- **Prisma ORM**: Handles all database operations with full type safety
- **Supabase PostgreSQL**: The underlying database

## Prerequisites

1. A Supabase account at [supabase.com](https://supabase.com)
2. A Supabase project created
3. Node.js 18+ installed

## Quick Start

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Then fill in your credentials from your [Supabase Dashboard](https://supabase.com/dashboard):

```env
# Database (from Project Settings > Database > Connection string)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

# Supabase Auth (from Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Note:** Use the "Transaction" mode connection string for `DATABASE_URL` and "Session" mode for `DIRECT_URL`.

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Apply Database Schema

Push the schema to your Supabase database:

```bash
npm run db:push
```

Or use migrations for version control:

```bash
npm run db:migrate
```

### 5. (Optional) Open Prisma Studio

To view and edit your data:

```bash
npm run db:studio
```

## Architecture

### File Structure

```
prisma/
├── schema.prisma      # Database schema definition

lib/
├── prisma.ts          # Prisma client singleton
├── db/
│   ├── index.ts       # Server-side database queries
│   └── actions.ts     # Server Actions for mutations
└── supabase/
    ├── client.ts      # Browser client (for auth)
    ├── server.ts      # Server client (for auth)
    ├── middleware.ts  # Auth session refresh
    └── index.ts       # Main exports

providers/
├── auth-provider.tsx           # Demo mode auth
└── supabase-auth-provider.tsx  # Production Supabase auth

app/
└── auth/
    ├── callback/route.ts       # OAuth callback handler
    └── error/page.tsx          # Auth error page
```

### Usage

#### Server Components (Recommended)

```tsx
// In Server Components, use Prisma directly
import { getClientCompanies, getClaimPacks } from '@/lib/db'

async function CompaniesPage() {
  const companies = await getClientCompanies()
  
  return (
    <div>
      {companies.map(company => (
        <div key={company.id}>{company.companyName}</div>
      ))}
    </div>
  )
}
```

#### Server Actions (For Mutations)

```tsx
"use client"

import { createCompanyAction } from '@/lib/db/actions'

function CreateCompanyForm() {
  async function handleSubmit(formData: FormData) {
    const result = await createCompanyAction({
      companyName: formData.get('name') as string,
      companyNumber: formData.get('number') as string,
    })
    
    if (result.success) {
      // Handle success
    }
  }

  return (
    <form action={handleSubmit}>
      <input name="name" placeholder="Company Name" />
      <button type="submit">Create</button>
    </form>
  )
}
```

#### Direct Prisma Access (API Routes)

```tsx
// In API routes or server-side code
import { prisma } from '@/lib/prisma'

export async function GET() {
  const companies = await prisma.clientCompany.findMany({
    where: { isActive: true },
    include: { accountingPeriods: true },
  })
  
  return Response.json(companies)
}
```

#### Authentication

```tsx
"use client"

import { useSupabaseAuth } from '@/providers/supabase-auth-provider'

function LoginForm() {
  const { signInWithEmail, signInWithGoogle, isLoading } = useSupabaseAuth()

  async function handleLogin(email: string, password: string) {
    const { success, error } = await signInWithEmail(email, password)
    if (!success) {
      console.error(error)
    }
  }

  return (
    <button onClick={signInWithGoogle}>
      Sign in with Google
    </button>
  )
}
```

## Authentication Methods

The Supabase auth provider supports:

| Method | Function | Description |
|--------|----------|-------------|
| Email/Password | `signInWithEmail()` | Traditional email login |
| Google OAuth | `signInWithGoogle()` | SSO with Google |
| Microsoft OAuth | `signInWithMicrosoft()` | SSO with Azure AD |
| Sign Up | `signUp()` | New user registration |
| Password Reset | `resetPassword()` | Email password reset |

### Setting Up OAuth Providers

1. Go to Supabase Dashboard > Authentication > Providers
2. Enable Google and/or Azure (Microsoft)
3. Add your OAuth credentials from Google Cloud Console / Azure Portal
4. Add redirect URLs: `https://your-app.com/auth/callback`

## Row Level Security (RLS)

Supabase uses PostgreSQL Row Level Security. Example policies:

```sql
-- Users can only see their own profile
CREATE POLICY "Users can view own profile"
ON taxengine_users FOR SELECT
USING (auth.uid()::text = uuid);

-- Authenticated users can view companies
CREATE POLICY "Authenticated users can view companies"
ON client_companies FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert/update companies
CREATE POLICY "Admins can manage companies"
ON client_companies FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM taxengine_users
    WHERE uuid = auth.uid()::text
    AND role = 'ADMINISTRATOR'
  )
);
```

## Demo Mode vs Production

The app supports both demo mode (mock data) and production mode (Supabase):

### Demo Mode (Default)
- Uses `AuthProvider` from `providers/auth-provider.tsx`
- Data comes from `lib/data.ts`
- No Supabase required

### Production Mode
- Uses `SupabaseAuthProvider` from `providers/supabase-auth-provider.tsx`
- Data fetched from Supabase using hooks
- Requires Supabase configuration

To switch between modes, update `app/layout.tsx`:

```tsx
// Demo mode
import { AuthProvider } from '@/providers/auth-provider'

// Production mode
import { SupabaseAuthProvider } from '@/providers/supabase-auth-provider'
```

## Available Data Hooks

| Hook | Description |
|------|-------------|
| `useClientCompanies()` | Fetch all active client companies |
| `useClientCompany(id)` | Fetch a single company by ID or UUID |
| `useAccountingPeriods(companyId)` | Fetch accounting periods for a company |
| `useClaimPacks(companyId?)` | Fetch claim packs, optionally filtered |
| `useSubmissions(companyId?)` | Fetch submissions, optionally filtered |
| `useAuditLogs(options?)` | Fetch audit logs with optional filters |
| `useTemplates()` | Fetch active document templates |
| `useGovernmentGateway()` | Fetch the default gateway configuration |

## Troubleshooting

### "Invalid API key" Error
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
- Ensure no trailing slashes in the URL

### Auth Not Persisting
- Make sure the middleware is running (check `middleware.ts`)
- Verify cookies are being set properly

### RLS Errors
- Check that the authenticated user has the correct role
- Review your RLS policies in Supabase Dashboard > Authentication > Policies

### OAuth Not Working
- Verify redirect URLs in Supabase Dashboard match your app URL
- Check that the OAuth provider is enabled and configured
