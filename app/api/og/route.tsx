import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'Grow your business without paying for ads';
  const description = searchParams.get('description') || 'Lead generation · Content syndication · Email nurture · CRM';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: '#080808',
          fontFamily: 'Inter, system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background gradient orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '100px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-50px',
            right: '50px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px',
            flex: 1,
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00D4FF, #3B82F6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 900,
                color: '#080808',
              }}
            >
              A
            </div>
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>Aryanka</span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: title.length > 60 ? '44px' : '52px',
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.1,
              marginBottom: '24px',
              maxWidth: '900px',
            }}
          >
            {title}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: '22px',
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 400,
              lineHeight: 1.4,
              maxWidth: '800px',
            }}
          >
            {description}
          </div>

          {/* URL */}
          <div
            style={{
              marginTop: '48px',
              fontSize: '18px',
              color: '#00D4FF',
              fontWeight: 500,
            }}
          >
            aryanka.io
          </div>
        </div>

        {/* Bottom border gradient */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #00D4FF, #3B82F6, #00D4FF)',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
