import { createFileRoute } from "@tanstack/react-router";

const EXTERNAL_BASE = "https://made10.retescuolevallagarina.it";

export const Route = createFileRoute("/api/directus")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const requestUrl = new URL(request.url);
        const path = requestUrl.searchParams.get("path");

        if (!path || !path.startsWith("/")) {
          return new Response(JSON.stringify({ error: "Missing API path" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const upstream = await fetch(`${EXTERNAL_BASE}${path}`);
        const headers = new Headers(upstream.headers);
        headers.delete("content-encoding");
        headers.delete("content-length");

        return new Response(upstream.body, {
          status: upstream.status,
          statusText: upstream.statusText,
          headers,
        });
      },
    },
  },
});