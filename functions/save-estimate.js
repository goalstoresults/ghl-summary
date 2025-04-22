export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();
    const { phone, ...fields } = data;

    if (!phone) {
      return new Response("Missing phone", { status: 400 });
    }

    // Get existing KV record (if any)
    let existing = {};
    const existingRaw = await env.acro.get(phone);
    if (existingRaw) {
      existing = JSON.parse(existingRaw);
    }

    // Merge new data
    const updated = { ...existing, ...fields };

    // Save to KV
    await env.acro.put(phone, JSON.stringify(updated));

    return new Response("Estimate saved", { status: 200 });
  } catch (err) {
    console.error("Error saving estimate:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
