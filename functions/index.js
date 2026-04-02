export async function onRequest(context) {
  const { env, request } = context;
  
  // 1. Define CORS Headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Notion-Version",
    "Access-Control-Max-Age": "86400",
  };

  // 2. Handle Preflight (OPTIONS) requests - CRITICAL for "Failed to fetch"
  if (request.method === "OPTIONS") {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    const token = env.NOTION_TOKEN;
    const dbId = env.DATABASE_ID;

    if (!token || !dbId) {
      return new Response(JSON.stringify({ 
        error: "Secrets missing. Set NOTION_TOKEN and DATABASE_ID in Cloudflare." 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 3. Fetch from Notion
    const notionResponse = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
    });

    const data = await notionResponse.json();

    // 4. Return Data with CORS headers
    return new Response(JSON.stringify(data), {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json" 
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
