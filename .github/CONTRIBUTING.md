# Contributing Guide

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- yarn package manager
- Accounts required:
  - [Supabase](https://supabase.com) account for the database
  - [Clerk](https://clerk.dev) account for authentication
  - [ngrok](https://ngrok.com) account interacting with webhooks for Clerk / RunPod on localhost

### Initial Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/runpod/openv.git
   cd openv
   ```

2. Install dependencies:

   ```bash
   yarn
   ```

3. Environment Setup:

   - Copy `.env.template` to `.env.local`
   - Create accounts and get API keys from:
     - Supabase:
       1. Create a new project
       2. Get the project URL and service key from Project Settings > API
       3. Enable Row Level Security (RLS) in your project
     - Clerk:
       1. Create a new application
       2. Get API keys from Clerk Dashboard > API Keys
       3. Configure OAuth providers if needed

4. Configure your `.env.local`: Follow https://www.youtube.com/watch?v=23wVXe4bWLk for step by step instructions

### Webhook Development Setup

1. Install ngrok: Follow the instructions here https://dashboard.ngrok.com/get-started/setup

2. Start your Next.js development server:

   ```bash
   yarn dev
   ```

3. In a new terminal, start ngrok:

   ```bash
   ngrok http 3000
   ```

> [!NOTE]
> Assuming that the project is running on port 3000

4. Configure webhooks using the ngrok URL:

   - Clerk Webhooks:

     1. Go to Clerk Dashboard > Webhooks
     2. Add endpoint: `https://<your-ngrok-url>/api/auth/webhook`
     3. Select relevant events (e.g., user created, updated)

### Database Management

1. Run migrations:

   ```bash
   npm run prisma:migrate
   ```

2. View your database with Prisma Studio (optional):
   ```bash
   npm run prisma:studio
   ```

## Development Workflow

1. Create a new branch for your feature/fix:

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. Make your changes and commit using conventional commits:

   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve issue with..."
   ```

3. Push your changes and create a pull request:
   ```bash
   git push origin feat/your-feature-name
   ```

## Testing

1. Run linting:

   ```bash
   yarn lint
   ```

2. Run type checking:

   ```bash
   yarn type-check
   ```

3. Test your changes thoroughly, especially webhook integrations using ngrok

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [Clerk Documentation](https://clerk.dev/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [ngrok Documentation](https://ngrok.com/docs)
