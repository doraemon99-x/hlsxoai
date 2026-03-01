export async function onRequest(context) {
  const { request } = context
  const reqUrl = new URL(request.url)
  const targetUrl = reqUrl.searchParams.get("url")

  if (!targetUrl) {
    return new Response("Missing ?url=", { status: 400 })
  }

  const headers = new Headers()

  headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
  headers.set("Referer", "https://xlz.livecdnem.com/")
  headers.set("Origin", "https://xlz.livecdnem.com")

  const response = await fetch(targetUrl, { headers })

  const contentType = response.headers.get("content-type") || ""

  // Kalau m3u8 → rewrite
  if (contentType.includes("application/vnd.apple.mpegurl") || targetUrl.endsWith(".m3u8")) {
    let text = await response.text()

    const base = targetUrl.substring(0, targetUrl.lastIndexOf("/") + 1)

    text = text.replace(/(?!#)(.+\.ts)/g, (match) => {
      const absolute = match.startsWith("http") ? match : base + match
      return `/hls?url=${encodeURIComponent(absolute)}`
    })

    return new Response(text, {
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Access-Control-Allow-Origin": "*"
      }
    })
  }

  // Kalau .ts → langsung stream
  return new Response(response.body, {
    headers: {
      "Content-Type": "video/mp2t",
      "Access-Control-Allow-Origin": "*"
    }
  })
}
