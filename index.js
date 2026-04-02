export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API Route
    if (url.pathname === "/api" || url.pathname === "/api/") {
      // Handle CORS Preflight
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Notion-Version",
          },
        });
      }

      try {
        console.log("Starting Notion request...");
        
        // Ensure tokens exist
        if (!env.NOTION_TOKEN || !env.DATABASE_ID) {
          throw new Error("Missing NOTION_TOKEN or DATABASE_ID in Cloudflare Variables");
        }

        const notionResponse = await fetch(`https://api.notion.com/v1/databases/${env.DATABASE_ID.trim()}/query`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.NOTION_TOKEN.trim()}`,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
          },
          // Send empty body to get all items with default sorting
          body: JSON.stringify({}),
        });

        const data = await notionResponse.json();

        if (!notionResponse.ok) {
          console.error("Notion API Error Details:", JSON.stringify(data));
          return new Response(JSON.stringify({ 
            error: "Notion API rejected the request", 
            details: data 
          }), {
            status: notionResponse.status,
            headers: { 
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*" 
            },
          });
        }

        console.log(`Success! Found ${data.results?.length || 0} items.`);

        return new Response(JSON.stringify(data), {
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" 
          },
        });

      } catch (err) {
        console.error("Worker Crash:", err.message);
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" 
          },
        });
      }
    }

    // Serve static assets
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not Found", { status: 404 });
  },
};
