// Docs collection no longer exists — return empty array for backward compatibility
// with the command palette search which fetches this endpoint.
export async function GET() {
  return new Response(JSON.stringify([]), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  });
}
