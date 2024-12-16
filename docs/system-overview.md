# Technical Flow

This document outlines the technical flow of video generation in OpenV.

## Video Generation Flow

The following diagram illustrates the interaction between different components of the system during
video generation and management:

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as API
    participant DB as Database
    participant RP as RunPod
    participant CS as Cloud Storage

    U->>FE: Enter prompt and request video
    FE->>API: Submit video generation request
    API->>DB: Validate request (auth, limits) and store job
    API->>RP: Trigger video generation job
    RP->>API: Return job ID
    API->>FE: Send job info (job ID)

    Note over RP: RunPod processes video asynchronously

    RP->>API: Webhook update (job status)
    API->>DB: Update job status

    FE->>API: Poll for job updates
    API->>DB: Get current job status
    DB->>API: Return status
    API->>FE: Return updated status

    U->>FE: Delete video request
    FE->>API: Delete video
    API->>DB: Mark video as deleted
    API->>CS: Delete video file
    CS->>API: Confirm deletion
    API->>FE: Confirm deleted
```

### Components

- **Frontend (FE)**: Next.js application handling user interactions and video display
- **API**: Next.js API routes managing requests and RunPod integration
- **Database (DB)**: Supabase PostgreSQL database storing video metadata and job information
- **RunPod (RP)**: AI inference platform running the video generation model
- **Cloud Storage (CS)**: Storage service for generated videos

### Process Description

1. **Video Generation Request**

    - User enters a prompt and requests video generation
    - Frontend submits request to `/api/runpod` endpoint
    - Creates a new video record in the database with status "queued"
    - Centralized `videoSubmit` helper handles RunPod submission and database updates
    - Returns video information to frontend

2. **RunPod Processing**

    - RunPod processes the video generation asynchronously
    - Sends webhook updates to `/api/runpod/webhook` endpoint
    - Webhook payload includes job status and output URLs

3. **Status Updates and Retry Logic**

    - Webhook endpoint receives status updates from RunPod
    - Updates video status in database (queued, processing, completed, failed)
    - Failed videos with retryable errors are automatically resubmitted
    - Maximum retry attempts are tracked to prevent infinite loops
    - Frontend polls the API for current status
    - Updates UI based on video status

4. **Video Management**
    - Users can view their generated videos
    - Delete functionality removes both database records and stored files

### Implementation Details

1. **API Endpoints**

    - `/api/runpod`: Handles video generation requests
    - `/api/runpod/webhook`: Processes RunPod status updates
    - `/api/videos`: Manages video metadata and user operations

2. **Database Schema**

    - Videos table tracks:
        - Generation status
        - User information
        - Prompt data
        - RunPod job ID (optional during creation)
        - Output URLs
        - Creation and update timestamps
        - Retry count and error messages

3. **Authentication**

    - Clerk handles user authentication
    - API routes are protected via middleware
    - User association maintained for all video operations

    #### Public Routes

    By default, Clerk's middleware automatically makes certain routes public:

    - Webhook endpoints (`/api/*/webhook`)
    - Authentication endpoints
    - Static files
    - Well-known endpoints

    This means our RunPod webhook endpoint (`/api/runpod/webhook`) is automatically public and
    protected by its own token-based authentication, while other API routes like `/api/videos`
    remain protected by Clerk.

    ### Authentication Flow

    1. **Auth Pattern**

        - Centralized auth utility in `lib/auth.ts`
        - Consistent error handling across all routes
        - Test mode support for integration testing

    2. **Protected Routes**

        - Use `auth()` and `requireAuth()` pattern
        - TypeScript ensures auth requirements are met
        - Proper error status codes (401 for unauthorized)

    3. **Test Mode**
        - Special handling for integration tests
        - Bypasses Clerk auth when `NEXT_PUBLIC_TEST_MODE=true`
        - Uses test user ID for consistency

4. **Error Handling**

    - Failed generations are tracked in database
    - Users notified of failures

5. **Testing**
    - Unit tests for API endpoints
    - Integration tests for some endpoints

## Video Generation and Status Updates

### Initial Video Creation

1. User submits a prompt and settings through the UI
2. Frontend sends a POST request to `/api/runpod` with the prompt and settings
3. Backend creates a new video record in the database with status "queued"
4. RunPod job is submitted with a webhook URL for status updates

### Status Updates

1. Frontend polls for updates in two ways:

    - Initial page load: Fetches all videos using GET `/api/videos`
    - Subsequent polls: Uses GET `/api/videos?updatedSince={timestamp}` to fetch only updated videos
    - The `updatedSince` parameter is a Unix timestamp in milliseconds
    - Only videos modified after this timestamp are returned
    - This reduces data transfer and improves performance

2. Backend webhook handling:

    - RunPod sends status updates to `/api/runpod/webhook`
    - Webhook updates video status in database
    - Status can be: "queued", "processing", "completed", or "failed"
    - When completed, the video URL is stored

3. Frontend state management:
    - Stores last update time after each successful fetch
    - Merges updated videos with existing state
    - Only polls when there are videos in processing state
    - Polling interval: 20 seconds

### Video Deletion

1. User requests video deletion
2. Frontend sends DELETE request to `/api/videos` with video IDs
3. Backend removes videos from database
4. Frontend updates local state to remove deleted videos

## API Endpoints

### GET /api/videos

- Returns all videos for authenticated user
- Optional `updatedSince` query parameter for incremental updates
- Response includes:
    ```typescript
    {
      id: number;
      jobId: string;
      userId: string;
      prompt: string;
      status: "queued" | "processing" | "completed" | "failed";
      url?: string;
      frames?: number;
      createdAt: string;
      updatedAt: string;
    }[]
    ```

### POST /api/runpod

- Creates new video generation job
- Request body:
    ```typescript
    {
      prompt: string;
      modelName: string;
      frames: number;
      input: {
        positive_prompt: string;
        negative_prompt?: string;
        width?: number;
        height?: number;
        seed?: number;
        steps?: number;
        cfg?: number;
        num_frames: number;
      }
    }
    ```

### DELETE /api/videos

- Deletes videos by job IDs
- Request body:
    ```typescript
    {
      jobIds: string[];
    }
    ```

## Troubleshooting

### Database Connection Issues

1. **Stored Procedures Error with Supabase**

    If you encounter errors related to stored procedures or prepared statements when using Prisma
    with Supabase, it's likely because the database URL is missing the required PgBouncer
    parameters.

    Solution: Add the following parameters to your `DATABASE_URL`:

    For serverless environments (e.g., Vercel):

    ```
    ?pgbouncer=true&connection_limit=1
    ```

    For local development or dedicated servers:

    ```
    ?pgbouncer=true
    ```

    Example for serverless:

    ```
    DATABASE_URL="postgresql://user:password@host:6543/postgres?pgbouncer=true&connection_limit=1"
    ```

    This is required because:

    - `pgbouncer=true` disables Prisma from generating prepared statements (required for PgBouncer
      in transaction mode)
    - `connection_limit=1` is needed ONLY in serverless environments to prevent connection pool
      exhaustion

    Note: Make sure to use port 6543 for the pooled connection (DATABASE_URL) and port 5432 for the
    direct connection (DIRECT_URL).
