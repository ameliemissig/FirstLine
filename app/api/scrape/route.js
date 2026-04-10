export async function POST(request) {
  try {
    const { url } = await request.json();
    if (!url) return Response.json({ error: "URL required" }, { status: 400 });
    // If the input isn't a URL, just pass it back as-is (user typed a company name)
    if (!/^https?:\/\//i.test(url)) {
      return Response.json({ text: `Company: ${url}` });
    }
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return Response.json({ text: `Company site: ${url} (fetch returned ${response.status})` });
    const html = await response.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 4500);
    return Response.json({ text: text || `Company site: ${url}` });
  } catch (e) {
    return Response.json({ text: `Company: (could not fetch site)` });
  }
}
