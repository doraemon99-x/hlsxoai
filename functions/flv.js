export async function onRequest(context) {
  const { request } = context
  const reqUrl = new URL(request.url)
  const videoUrl = reqUrl.searchParams.get("url")

  if (!videoUrl) {
    return new Response("Missing ?url=", { status: 400 })
  }

  const headers = new Headers()

  // Penting buat seek
  const range = request.headers.get("Range")
  if (range) headers.set("Range", range)

  // Spoof browser biar lolos proteksi CDN
  headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
  headers.set("Referer", "https://xlz.livecdnem.com/")
  headers.set("Origin", "https://xlz.livecdnem.com")

  const response = await fetch(videoUrl, {
    headers,
    cf: {
      cacheEverything: false
    }
  })

  const newHeaders = new Headers(response.headers)

  newHeaders.set("Access-Control-Allow-Origin", "*")
  newHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
  newHeaders.set("Access-Control-Allow-Headers", "*")
  newHeaders.set("Content-Type", "video/x-flv")

  return new Response(response.body, {
    status: response.status,
    headers: newHeaders
  })
}
