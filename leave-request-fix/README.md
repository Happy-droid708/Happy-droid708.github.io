# Leave Request API Fix

Fixed Vercel serverless leave-request handler.

## Changes

- Validates `startDate` and `endDate` as real `YYYY-MM-DD` dates.
- Rejects `endDate` before `startDate` with HTTP 400.
- Handles malformed request bodies safely.
- Adds `GET /api/leave-request?status=pending` filtering.
- Returns all requests when no status filter is supplied.
- Returns HTTP 405 for unsupported methods and advertises `GET, POST`.
- Catches unexpected errors and returns a clean HTTP 500 JSON response.

## File

`api/leave-request.js`
