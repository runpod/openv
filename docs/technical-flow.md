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

1. **Video Generation**

    - User enters a prompt and requests video generation
    - Frontend submits request to API
    - API validates and stores the job
    - RunPod processes the video asynchronously
    - Frontend polls for status updates

2. **Video Management**
    - Users can delete their videos
    - System cleans up both database records and stored files
    - All operations are authenticated and authorized
