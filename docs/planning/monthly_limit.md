**User Story**  
As a user, I want a monthly video generation limit that can also be enforced within custom date
ranges, so I never exceed my allowed usage, and admins can easily adjust or reset these limits.

**Acceptance Criteria**

1. **Configurable Window and Limit**

    - The system reads a start date (`LIMIT_START_DATE`) and end date (`LIMIT_END_DATE`) from
      environment variables.
        - If these are set, the limit applies only within that date range.
        - If these are not set, the system defaults to a standard monthly cycle (e.g., usage resets
          on the 1st of each month).
    - The total allowed monthly usage (e.g., `MONTHLY_LIMIT_SECONDS`) is also set via environment
      variables.

2. **Usage Tracking and Enforcement**

    - Each user has a `monthlyUsage` field (in seconds) that is incremented whenever they create a
      job.
    - On each job creation (`POST /api/runpod`):
        1. Check if the current date is within the custom date range (`LIMIT_START_DATE` to
           `LIMIT_END_DATE`).
            - If yes, enforce the usage limit for that range.
            - If not, fallback to the standard monthly logic (e.g., usage resets on the 1st).
        2. Compare `(current monthlyUsage + requestedVideoDuration)` to `MONTHLY_LIMIT_SECONDS`.
            - If it exceeds the limit, return an error (e.g., 403 or 409) with a clear message (“You
              have reached your monthly limit.”).
            - Otherwise, allow the job and add the requested video duration to `monthlyUsage`.

3. **Monthly Reset or End-of-Period Behavior**

    - When the date range ends (`LIMIT_END_DATE` is reached), the system reverts to the normal
      monthly cycle.
    - If no date range is defined, the system uses a standard monthly reset strategy (e.g.,
      resetting `monthlyUsage` to 0 on the 1st).
    - Document how and when these resets occur so that admins can update the usage policy if needed.

4. **Documentation**
    - In `docs/system-overview.md`, describe how the start date, end date, and monthly usage limit
      are read from environment variables.
    - Provide examples:
        - A standard monthly cycle (no start/end date, 600 seconds limit).
        - A special date range (Dec 16 – Jan 16) with a higher or lower limit.
