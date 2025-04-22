export async function onRequest(context) {
  const { request, env } = context;

  // Define CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "https://acrocontractor.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };

  // 1. Handle preflight (OPTIONS)
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // 2. Handle non-POST methods
  if (request.method !== "POST") {
    return new Response("Only POST allowed", {
      status: 405,
      headers: corsHeaders
    });
  }

  // 3. Process estimate data
  try {
    const data = await request.json();
    const { phone, ...fields } = data;

    if (!phone) {
      return new Response("Missing phone", {
        status: 400,
        headers: corsHeaders
      });
    }

    let existing = {};
    const existingRaw = await env.acro.get(phone);
    if (existingRaw) {
      existing = JSON.parse(existingRaw);
    }

    const updated = { ...existing, ...fields };
    await env.acro.put(phone, JSON.stringify(updated));

    return new Response("Estimate saved", {
      status: 200,
      headers: corsHeaders
    });

  } catch (err) {
    console.error("Worker error:", err);
    return new Response("Internal Server Error", {
      status: 500,
      headers: corsHeaders
    });
  }
}
