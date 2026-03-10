import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PLATFORM_GUIDES = {
  linkedin: 'LinkedIn: professional tone, 1200-1800 chars ideal, use line breaks for readability, end with a question or CTA, no hashtag spam (max 3-5 relevant hashtags)',
  twitter: 'Twitter/X: punchy, 240-280 chars max (reserve space for link), hook in first line, 1-2 hashtags max, conversational',
  reddit: 'Reddit: authentic, value-first, no self-promo tone, conversational, share insights rather than selling, respect community norms',
  youtube: 'YouTube: description format, hook first 2 lines (visible without expand), include timestamps if relevant, keywords naturally, call to subscribe',
  instagram: 'Instagram: visual-first caption, hook in first line, storytelling, 5-10 hashtags at end, emojis encouraged',
};

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 503 });
  }

  const { mode, topic, tone, platform, existing_content, blog_url } = await req.json();

  let prompt = '';

  if (mode === 'write') {
    const platformGuide = PLATFORM_GUIDES[platform as keyof typeof PLATFORM_GUIDES] || 'General social media post';
    prompt = `Write a ${tone || 'professional'} social media post for ${platform} about: "${topic}"

Platform guidelines: ${platformGuide}

Return ONLY the post content, no explanations or quotation marks. Make it authentic, engaging, and ready to post.`;

  } else if (mode === 'repurpose') {
    const platformGuide = PLATFORM_GUIDES[platform as keyof typeof PLATFORM_GUIDES] || 'General social media post';
    prompt = `Repurpose this blog post/content into a ${platform} post:

Blog URL or content: ${blog_url || topic}

Platform guidelines: ${platformGuide}
Tone: ${tone || 'professional'}

Extract 1-3 key insights and turn them into an engaging ${platform} post. Return ONLY the post content.`;

  } else if (mode === 'improve') {
    const platformGuide = PLATFORM_GUIDES[platform as keyof typeof PLATFORM_GUIDES] || 'General social media post';
    prompt = `Improve this ${platform} post to be more engaging:

Original: ${existing_content}

Platform guidelines: ${platformGuide}
Keep the core message but make it more compelling, better formatted, and more likely to get engagement.
Return ONLY the improved post content.`;

  } else if (mode === 'all_platforms') {
    prompt = `Create platform-optimized versions of this content for all major social platforms:

Topic/Content: "${topic}"
Tone: ${tone || 'professional'}

Return a JSON object with exactly these keys: linkedin, twitter, reddit, youtube, instagram
Each value should be the complete post for that platform, following these guidelines:
- LinkedIn: ${PLATFORM_GUIDES.linkedin}
- Twitter: ${PLATFORM_GUIDES.twitter}
- Reddit: ${PLATFORM_GUIDES.reddit}
- YouTube: ${PLATFORM_GUIDES.youtube}
- Instagram: ${PLATFORM_GUIDES.instagram}

Return only valid JSON, no markdown.`;
  }

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    if (mode === 'all_platforms') {
      try {
        const cleaned = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
        const variants = JSON.parse(cleaned);
        return NextResponse.json({ variants });
      } catch {
        return NextResponse.json({ content: text });
      }
    }

    return NextResponse.json({ content: text.trim() });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: 'Rate limit reached. Try again in a moment.' }, { status: 429 });
    }
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
  }
}
