import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 503 });
  }

  const { topic, keywords, tone = 'professional', length = 'medium' } = await req.json();

  if (!topic) {
    return NextResponse.json({ error: 'topic is required' }, { status: 400 });
  }

  const wordCount = length === 'short' ? '600-800' : length === 'long' ? '1500-2000' : '900-1200';

  const prompt = `Write a high-quality, SEO-optimized blog post about: "${topic}"

Requirements:
- Target keywords: ${keywords || topic}
- Tone: ${tone} (yet engaging and readable)
- Length: approximately ${wordCount} words
- Format: Use ## for H2 headings, ### for H3 headings, **bold** for emphasis
- Include: introduction, 3-5 main sections with subheadings, practical examples, conclusion
- SEO: naturally integrate keywords, avoid keyword stuffing
- Do NOT include a title in the body (it will be used separately)

Return a JSON object with exactly these fields:
{
  "title": "Compelling SEO title (60-65 chars)",
  "excerpt": "Meta description (150-160 chars, includes primary keyword)",
  "content": "Full markdown content (no title header at top)",
  "tags": ["tag1", "tag2", "tag3"],
  "reading_time": <estimated minutes as number>
}

Important: Return only valid JSON, no markdown code blocks, no extra text.`;

  try {
    const client = getAnthropicClient();

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    // Parse the JSON response
    let generated: {
      title: string;
      excerpt: string;
      content: string;
      tags: string[];
      reading_time: number;
    };

    try {
      // Strip potential markdown code blocks
      const cleaned = rawText.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
      generated = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ generated });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: 'Invalid ANTHROPIC_API_KEY' }, { status: 401 });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: 'AI rate limit reached. Please try again in a moment.' }, { status: 429 });
    }
    return NextResponse.json({ error: 'AI generation failed. Please try again.' }, { status: 500 });
  }
}
