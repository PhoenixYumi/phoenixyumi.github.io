export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. ROUTING: If the path is /api, run the Notion logic
    if (url.pathname === "/api" || url.pathname === "/index") {
      
      // Handle CORS Preflight (important for browsers)
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Accept",
          },
        });
      }

      try {
        const response = await fetch(`https://api.notion.com/v1/databases/${env.DATABASE_ID}/query`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.NOTION_TOKEN}`,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page_size: 100,
            sorts: [{ property: "Name", direction: "ascending" }]
          }),
        });

        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" 
          },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    // 2. FALLBACK: If it's not an API call, serve the static assets (index.html)
    // Cloudflare Workers with Assets automatically does this if we return nothing 
    // or if the assets fetcher is called.
    return env.ASSETS.fetch(request);
  },
};
