import { ImageResponse } from '@vercel/og';

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
  const modeText = isDaily
    ? (lang === 'da' ? 'Dagens Udfordring' : 'Daily Challenge')
    : (lang === 'da' ? 'Uendelig Mode' : 'Endless Mode');

  const scoreLabel = lang === 'da' ? 'Score' : 'Score';
  const wordsLabel = lang === 'da' ? 'Ord' : 'Words';
  const longestLabel = lang === 'da' ? 'Længste ord' : 'Longest word';
  const rankLabel = lang === 'da' ? 'Placering' : 'Rank';
  const playNow = lang === 'da' ? 'Spil nu på letsword.app' : 'Play now at letsword.app';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <span style={{ fontSize: '72px' }}>⚡</span>
          <span
            style={{
              fontSize: '64px',
              fontWeight: 800,
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            LetsWord
          </span>
        </div>

        {/* Mode badge */}
        <div
          style={{
            display: 'flex',
            padding: '12px 32px',
            background: isDaily ? 'rgba(251, 146, 60, 0.9)' : 'rgba(34, 197, 94, 0.9)',
            borderRadius: '24px',
            marginBottom: '32px',
          }}
        >
          <span
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: 'white',
            }}
          >
            {modeText}
          </span>
        </div>

        {/* Score card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '32px',
            padding: '40px 80px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Main score */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <span
              style={{
                fontSize: '96px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {score}
            </span>
            <span
              style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              {scoreLabel}
            </span>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              gap: '48px',
              alignItems: 'center',
            }}
          >
            {/* Words count */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '48px',
                  fontWeight: 700,
                  color: '#374151',
                }}
              >
                {words}
              </span>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 500,
                  color: '#9ca3af',
                }}
              >
                {wordsLabel}
              </span>
            </div>

            {/* Longest word */}
            {longest && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '36px',
                    fontWeight: 700,
                    color: '#374151',
                    textTransform: 'uppercase',
                  }}
                >
                  {longest}
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 500,
                    color: '#9ca3af',
                  }}
                >
                  {longestLabel}
                </span>
              </div>
            )}

            {/* Rank for daily */}
            {isDaily && rank && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '48px',
                    fontWeight: 700,
                    color: rank === '1' ? '#eab308' : rank === '2' ? '#9ca3af' : rank === '3' ? '#d97706' : '#374151',
                  }}
                >
                  #{rank}
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 500,
                    color: '#9ca3af',
                  }}
                >
                  {rankLabel}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Play now CTA */}
        <div
          style={{
            display: 'flex',
            marginTop: '32px',
          }}
        >
          <span
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            {playNow}
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
