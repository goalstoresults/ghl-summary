export async function onRequest(context) {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "https://acrocontractor.com",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }

  if (request.method !== "POST") {
    return new Response("Only POST allowed", {
      status: 405,
      headers: { "Access-Control-Allow-Origin": "https://acrocontractor.com" }
    });
  }

  try {
    const data = await request.json();
    const { phone, ...fields } = data;

    if (!phone) {
      return new Response("Missing phone", {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "https://acrocontractor.com" }
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
      headers: { "Access-Control-Allow-Origin": "https://acrocontractor.com" }
    });

  } catch (err) {
    console.error("Error saving estimate:", err);
    return new Response("Internal Server Error", {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "https://acrocontractor.com" }
    });
  }
}

