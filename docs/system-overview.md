# Technical Flow

This document outlines the technical flow of video generation in OpenV.

## Core Architecture

### Data Access Patterns

The system follows a clear separation of concerns for data access:

1. **Authentication (Clerk)**

    - Source of truth for user identity
    - Handles email verification and uniqueness
    - Manages user sessions and tokens
    - Webhooks notify system of user events

2. **Database Access (Prisma)**

    - Single pattern for all database operations
    - No direct Supabase client usage
    - Handles application-specific user data
    - Manages terms acceptance and video metadata
    - Tracks monthly video generation usage

3. **Storage (UploadThing)**

    - Handles video file uploads
    - Secure, direct-to-cloud storage
    - Integrated with Next.js API routes

4. **AI Processing (RunPod)**
    - Runs worker-mochi container
    - Handles video generation
    - Asynchronous webhook updates

```mermaid
flowchart TD
    A[Client] --> B[Next.js App Router]
    B --> C[Clerk Auth]
    B --> D[Prisma]
    B --> E[UploadThing]
    B --> F[RunPod]
    C -- webhook --> G[User Sync]
    G --> D
    F -- worker-mochi --> H[Video Generation]
    H --> E
```

### Core Components

1. **worker-mochi Container**

    - Custom Docker container for video generation
    - Runs on RunPod infrastructure
    - Implements Mochi model for video creation
    - Handles:
        - Prompt processing
        - Frame generation
        - Video compilation
        - Error handling

2. **UploadThing Integration**
    - Secure file uploads
    - Direct-to-cloud storage
    - Automatic file type validation
    - Integrated with Next.js API routes

### Core Flows

1. **Authentication Flow**

    ```mermaid
    sequenceDiagram
        participant U as User
        participant C as Clerk
        participant W as Webhook
        participant DB as Database

        U->>C: Sign up/Sign in
        C->>W: User event
        W->>DB: Create/Update user record
        Note over DB: No email uniqueness<br/>User_id is unique identifier
    ```

2. **Terms Acceptance Flow**

    ```mermaid
    sequenceDiagram
        participant U as User
        participant P as Protected Route
        participant DB as Database

        U->>P: Access route
        P->>DB: Check terms acceptance
        alt Not Accepted
            P->>U: Redirect to terms
            U->>DB: Accept terms
            Note over DB: Retry pattern for<br/>acceptance verification
            U->>P: Return to route
        end
    ```

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
    participant WM as worker-mochi
    participant UT as UploadThing

    U->>FE: Enter prompt and request video
    FE->>API: Submit video generation request
    API->>DB: Validate request (auth, limits) and store job
    API->>RP: Trigger video generation job
    RP->>WM: Start worker-mochi container
    WM->>API: Return job ID
    API->>FE: Send job info (job ID)

    Note over WM: worker-mochi processes<br/>video asynchronously

    WM->>UT: Upload generated video
    UT->>API: Return upload URL
    WM->>API: Webhook update (job status + URL)
    API->>DB: Update job status

    FE->>API: Poll for job updates
    API->>DB: Get current job status
    DB->>API: Return status
    API->>FE: Return updated status

    U->>FE: Delete video request
    FE->>API: Delete video
    API->>DB: Mark video as deleted
    API->>UT: Delete video file
    UT->>API: Confirm deletion
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

## Terms of Use Acceptance Flow

The system enforces Terms of Use acceptance before users can access certain protected features.

### Components

1. **Database**

    - `terms_acceptance` table tracks user acceptance:

        ```prisma
        model terms_acceptance {
          id         Int      @id @default(autoincrement())
          userId     String
          version    String
          acceptedAt DateTime @default(now())
          updatedAt  DateTime @updatedAt

          @@unique([userId, version])
          @@index([userId])
        }
        ```

2. **Middleware**

    - Protects specific routes (e.g., `/my-videos`)
    - Checks terms acceptance status via API
    - Redirects to acceptance page if needed

3. **API Endpoints**
    - `/api/terms/check`: Verifies if user has accepted current version
    - `/api/terms/accept`: Records user's acceptance

### Version Management

The current terms version is managed in `lib/terms.ts`:

```typescript
export const CURRENT_TOS_VERSION = "1.0.0";
```

To update terms:

1. Update the terms content in `app/terms/terms.md`
2. Increment `CURRENT_TOS_VERSION` in `lib/terms.ts`
3. Users will be required to accept the new version before accessing protected routes

### Protected Routes

Configure which routes require terms acceptance in `middleware.ts`:

```typescript
const TOS_PROTECTED_PATHS = ["/my-videos"];
```

### Flow Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant MW as Middleware
    participant API as API
    participant DB as Database
    participant P as Protected Page

    U->>P: Access protected route
    P->>MW: Route request
    MW->>API: Check terms acceptance
    API->>DB: Query acceptance status
    DB->>API: Return status
    API->>MW: Return acceptance status

    alt Terms Not Accepted
        MW->>U: Redirect to /terms/accept
        U->>API: Accept terms
        API->>DB: Store acceptance
        API->>U: Redirect to original route
        U->>P: Access protected route
        P->>MW: Route request
        MW->>API: Check terms acceptance
        API->>DB: Query acceptance status
        DB->>API: Return status (accepted)
        API->>MW: Return acceptance status
        MW->>P: Allow access
        P->>U: Show protected content
    else Terms Already Accepted
        MW->>P: Allow access
        P->>U: Show protected content
    end
```

The system maintains a history of all terms acceptances, allowing tracking of which versions each
user has accepted and when.

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

## Implementation Patterns

### Database Access

All database operations follow these patterns:

1. **User Operations**

    - Create/update through Clerk webhook
    - User_id as primary identifier
    - No email uniqueness constraint
    - Application-specific data only

2. **Terms Acceptance**

    - Version-based acceptance tracking
    - Retry pattern for verification
    - Required for protected routes

3. **Video Management**
    - Metadata in database
    - Files in storage
    - Status tracking and updates

### Error Handling

Standard error patterns across the system:

1. **Database Errors**

    - Retry logic for transient failures
    - Clear error messages
    - Proper status codes

2. **Auth Errors**

    - Handled by Clerk middleware
    - No redundant checks needed

3. **Terms Acceptance Errors**
    - Retry pattern for verification
    - Clear user feedback

### Monthly Usage Limits

The system enforces monthly video generation limits with configurable date ranges:

1. **Environment Variables**

    - `MONTHLY_LIMIT_SECONDS`: Total allowed monthly usage in seconds (default: 600)
    - `LIMIT_START_DATE`: Optional custom period start date (ISO format)
    - `LIMIT_END_DATE`: Optional custom period end date (ISO format)

2. **Usage Tracking**

    ```mermaid
    sequenceDiagram
        participant U as User
        participant API as API
        participant DB as Database
        participant RP as RunPod

        U->>API: Request video generation
        API->>DB: Check monthly usage
        alt Usage Limit Exceeded
            DB->>API: Return remaining seconds
            API->>U: Return 403 with limit message
        else Usage Within Limit
            API->>RP: Submit video job
            API->>DB: Increment usage
            API->>U: Return success with remaining seconds
        end
    ```

3. **Reset Behavior**
    - Standard monthly reset: Usage resets on the 1st of each month
    - Custom date range: Usage resets when entering the defined period
    - Outside custom range: Falls back to standard monthly reset

### Examples

1. **Standard Monthly Cycle**

    ```env
    MONTHLY_LIMIT_SECONDS=600
    # No LIMIT_START_DATE or LIMIT_END_DATE set
    # Usage resets on the 1st of each month
    ```

2. **Custom Date Range**
    ```env
    MONTHLY_LIMIT_SECONDS=900
    LIMIT_START_DATE=2023-12-16T00:00:00Z
    LIMIT_END_DATE=2024-01-16T23:59:59Z
    # Higher limit for holiday period
    ```
