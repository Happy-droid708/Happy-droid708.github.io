// api/leave-request.js — Vercel serverless function (Node.js)
// Fixed version for the leave-request API exercise.

const leaveRequests = []; // In-memory store is fine for this exercise.

// FIX: Validate date-only values strictly as YYYY-MM-DD and reject impossible dates.
function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.getUTCFullYear() === Number(value.slice(0, 4)) &&
    date.getUTCMonth() + 1 === Number(value.slice(5, 7)) &&
    date.getUTCDate() === Number(value.slice(8, 10))
  );
}

export default function handler(req, res) {
  // FIX: Wrap the entire handler so malformed input/unexpected errors return JSON
  // instead of causing the serverless function to crash.
  try {
    // FIX: Handle unsupported HTTP methods explicitly with 405.
    if (req.method !== "POST" && req.method !== "GET") {
      res.setHeader("Allow", "GET, POST");
      return res.status(405).json({
        error: "Method not allowed. Use GET or POST.",
      });
    }

    if (req.method === "POST") {
      // BUG (original): const { employeeId, startDate, endDate, reason } = req.body;
      // FIX: Check that req.body is an object before destructuring it.
      if (
        !req.body ||
        typeof req.body !== "object" ||
        Array.isArray(req.body)
      ) {
        return res.status(400).json({
          error: "Invalid request body. Expected a JSON object.",
        });
      }

      const { employeeId, startDate, endDate, reason } = req.body;

      // BUG (original): no validation that startDate/endDate exist or are valid.
      // FIX: Reject missing/invalid startDate with a clear 400 response.
      if (!isValidDate(startDate)) {
        return res.status(400).json({
          error: "startDate is required and must be a valid date in YYYY-MM-DD format.",
        });
      }

      // FIX: Reject missing/invalid endDate with a clear 400 response.
      if (!isValidDate(endDate)) {
        return res.status(400).json({
          error: "endDate is required and must be a valid date in YYYY-MM-DD format.",
        });
      }

      // BUG (original): no validation that endDate is not before startDate.
      // FIX: Compare normalized UTC dates and reject an invalid date range.
      if (endDate < startDate) {
        return res.status(400).json({
          error: "endDate cannot be before startDate.",
        });
      }

      const request = {
        id: leaveRequests.length + 1,
        employeeId,
        startDate,
        endDate,
        reason,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      leaveRequests.push(request);
      return res.status(201).json(request);
    }

    if (req.method === "GET") {
      // BUG (original): res.status(200).json(leaveRequests);
      // FIX: Read ?status=pending (or any status) and filter only when provided.
      const status = req.query?.status;

      const filteredRequests = status
        ? leaveRequests.filter((request) => request.status === status)
        : leaveRequests;

      return res.status(200).json(filteredRequests);
    }
  } catch (error) {
    // FIX: Unexpected runtime errors now return a clean JSON 500 response.
    console.error("Leave request handler error:", error);

    return res.status(500).json({
      error: "Internal server error. Please try again later.",
    });
  }
}
