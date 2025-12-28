// This serverless function serves a simple HTML page with dynamic OG meta tags
// When shared on Facebook, the crawler will see these meta tags and use them for the preview

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);

  // Get parameters from URL
  const score = searchParams.get('score') || '0';
  const words = searchParams.get('words') || '0';
  const longest = searchParams.get('longest') || '';
  const rank = searchParams.get('rank') || '';
  const mode = searchParams.get('mode') || 'endless';
  const lang = searchParams.get('lang') || 'da';

  const isDaily = mode === 'daily';

  // Build OG image URL with same parameters
  const ogImageUrl = new URL('/api/og', request.url);
  ogImageUrl.search = searchParams.toString();

  // Title and description based on mode and language
  const title = 'LetsWord';
  const modeText = isDaily
    ? (lang === 'da' ? 'Dagens Udfordring' : 'Daily Challenge')
    : (lang === 'da' ? 'Uendelig Mode' : 'Endless Mode');

  const description = lang === 'da'
    ? `${modeText} - Score: ${score} | ${words} ord${longest ? ` | Længste: ${longest}` : ''}${rank ? ` | #${rank}` : ''}`
    : `${modeText} - Score: ${score} | ${words} words${longest ? ` | Longest: ${longest}` : ''}${rank ? ` | #${rank}` : ''}`;

  // Return HTML with OG meta tags that redirects to the main app
  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${modeText}</title>

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${request.url}">
  <meta property="og:title" content="${title} - ${modeText}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${ogImageUrl.toString()}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title} - ${modeText}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImageUrl.toString()}">

  <!-- Redirect to main app after a short delay for crawlers -->
  <meta http-equiv="refresh" content="0;url=https://letsword.app">

  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      color: white;
      text-align: center;
    }
    .container {
      padding: 40px;
    }
    h1 {
      font-size: 48px;
      margin-bottom: 16px;
    }
    p {
      font-size: 20px;
      opacity: 0.9;
    }
    a {
      color: white;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚡ LetsWord</h1>
    <p>${lang === 'da' ? 'Omdirigerer til spillet...' : 'Redirecting to the game...'}</p>
    <p><a href="https://letsword.app">${lang === 'da' ? 'Klik her hvis du ikke omdirigeres' : 'Click here if not redirected'}</a></p>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
