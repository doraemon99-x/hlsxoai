export async function onRequest(context) {
  const { request } = context
  const reqUrl = new URL(request.url)
  const targetUrl = reqUrl.searchParams.get("url")

  if (!targetUrl) {
    return new Response("Missing ?url=", { status: 400 })
  }

  // 🔐 DOMAIN WHITELIST (WAJIB EDIT sesuai target kamu)
  const allowedDomains = [
    "golivenow71.com",
    "livecdnem.com"
  ]

  const isAllowed = allowedDomains.some(domain =>
    targetUrl.includes(domain)
  )

  if (!isAllowed) {
    return new Response("Forbidden", { status: 403 })
  }

  try {
    const headers = new Headers()
    headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
    headers.set("Referer", "https://xlz.livecdnem.com/")
    headers.set("Origin", "https://xlz.livecdnem.com")

    const response = await fetch(targetUrl, {
      headers,
      cf: { cacheEverything: false }
    })

    if (!response.ok) {
      return new Response("Upstream error", { status: response.status })
    }

    const contentType = response.headers.get("content-type") || ""

    // 🎯 Kalau playlist (.m3u8)
    if (
      contentType.includes("application/vnd.apple.mpegurl") ||
      contentType.includes("application/x-mpegURL") ||
      targetUrl.endsWith(".m3u8")
    ) {
      let text = await response.text()

      const base = targetUrl.substring(0, targetUrl.lastIndexOf("/") + 1)

      const rewritten = text
        .split("\n")
        .map(line => {
          line = line.trim()

          if (line.startsWith("#") || line === "") {
            return line
          }

          const absolute = line.startsWith("http")
            ? line
            : base + line

          return `/hls?url=${encodeURIComponent(absolute)}`
        })
        .join("\n")

      return new Response(rewritten, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*"
        }
      })
    }

    // 🎯 Segment (.ts / .m4s)
    return new Response(response.body, {
      headers: {
        "Content-Type": contentType || "video/mp2t",
        "Access-Control-Allow-Origin": "*"
      }
    })

  } catch (err) {
    return new Response("Internal error", { status: 500 })
  }
}
