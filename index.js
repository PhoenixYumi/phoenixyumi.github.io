export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Route for the Notion API
    if (url.pathname === "/api") {
      // Handle CORS for the browser
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
          headers: { 
            "Content-Type": "application/json", 
            "Access-Control-Allow-Origin": "*" 
          },
        });
      }
    }

    // Default: Try to serve static assets from the /public folder
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    // Fallback if assets are missing
    return new Response("Not Found", { status: 404 });
  },
};
