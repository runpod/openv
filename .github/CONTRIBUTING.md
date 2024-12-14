# Contributing Guide

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- yarn package manager
- [ngrok](https://ngrok.com) - Required for:
    - Local development with Clerk authentication
    - Testing webhooks (Clerk, RunPod)
    - Running integration tests
- Accounts required:
    - [Supabase](https://supabase.com) account for the database
    - [Clerk](https://clerk.dev) account for authentication

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

3. Install and configure ngrok:

    - Follow the setup instructions at https://dashboard.ngrok.com/get-started/setup
    - Start ngrok in a separate terminal:
        ```bash
        ngrok http 3001
        ```
    - Keep ngrok running during development - it's required for:
        - Clerk authentication to work locally
        - Webhook development and testing
        - Running integration tests

4. Environment Setup:

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
            4. Update Clerk settings with your ngrok URL

5. Configure your `.env.local`: Follow https://www.youtube.com/watch?v=23wVXe4bWLk for step by step
   instructions

6. Start your Next.js development server:

    ```bash
    # For regular development
    yarn dev

    # For testing with test environment
    yarn dev:test  # This uses .env.test configuration
    ```

### Webhook Configuration

With ngrok running, configure your webhooks:

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

We have two types of tests: unit tests and integration tests.

### Unit Tests

Unit tests mock external dependencies (database, APIs) and test components in isolation:

```bash
# Run unit tests
npm run test:unit

# Watch mode for development
npm run test:watch
```

### Integration Tests

Integration tests use a real test database and ngrok for webhook testing:

1. Set up your test database in `.env.test`:

    ```
    TEST_DATABASE_URL="your_test_database_url"
    TEST_DIRECT_URL="your_test_direct_url"
    ```

2. Run integration tests:

    ```bash
    # Recommended: Run everything with one command
    # This script handles the complete setup:
    # - Kills any existing ngrok/Next.js processes
    # - Starts ngrok
    # - Starts Next.js dev server
    # - Runs the tests
    # - Cleans up all processes when done
    ./scripts/run-integration-tests.sh
    ```

    > Note: If you already have ngrok and Next.js running (e.g., during development), you can just
    > run the tests directly with `npm run test:integration`. This will only run the tests without
    > starting/stopping services.

### Manual Integration Test Setup

For debugging or development, you can run the integration tests manually:

1. Start ngrok:

    ```bash
    ngrok http 3001
    ```

    > [!NOTE] The tests will automatically get your ngrok URL from ngrok's API at
    > `http://localhost:4040/api/tunnels`

2. Start Next.js:

    ```bash
    yarn dev
    ```

3. Run the tests:

    ```bash
    npm run test:integration
    ```

4. Watch the test output:
    - You should see "Using ngrok URL: https://xxxx-xx-xx-xxx-xx.ngrok-free.app"
    - The test will create a video job
    - It will wait for the webhook callback (up to 2 minutes)
    - You can monitor the job status in the logs

The integration tests will:

- Set up a clean test database
- Run tests that interact with real services
- Clean up the test database when done

### Test Files Organization

- `__tests__/api/**/**.test.ts` - Unit tests for API routes
- `__tests__/integration/**/**.integration.test.ts` - Integration tests
- `jest.setup.ts` - Unit test setup and mocks
- `jest.setup.integration.ts` - Integration test setup

### Writing Tests

1. Unit Tests:

    - Mock external dependencies using Jest
    - Focus on testing business logic
    - Keep tests fast and isolated

2. Integration Tests:
    - Test complete workflows
    - Use real database connections
    - Test webhook interactions
    - Verify data persistence

### Continuous Integration

Our CI pipeline runs both unit and integration tests:

- Unit tests run on every PR
- Integration tests run on main branch merges

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [Clerk Documentation](https://clerk.dev/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [ngrok Documentation](https://ngrok.com/docs)
