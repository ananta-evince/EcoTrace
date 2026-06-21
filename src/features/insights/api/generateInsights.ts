'use server';

import { requireUserId } from '@/lib/session';
import { generateGeminiContent } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';
import { hashString } from '@/lib/utils';
import { getCarbonSummary } from '@/features/tracking/api/carbonSummaryRepository';

const MAX_RETRIES = 3;
const TIMEOUT_MS = 30_000;

const COACH_SYSTEM = `You are EcoTrace's personal carbon coach. Be warm, specific, and non-judgmental.
Always ground advice in the user's actual data. Never use vague platitudes.
Format: 3 numbered insights, each ≤ 80 words. End with one concrete "this week" action.`;

async function withRetry<T>(fn: (signal: AbortSignal) => Promise<T>): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const result = await fn(controller.signal);
      clearTimeout(timeout);
      return result;
    } catch (e) {
      clearTimeout(timeout);
      lastError = e instanceof Error ? e : new Error(String(e));
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }
  throw lastError ?? new Error('Failed after retries');
}

function buildUserPrompt(summary: Awaited<ReturnType<typeof getCarbonSummary>>): string {
  return `My carbon summary for the last 4 weeks:
Total: ${summary.totalKgCO2e.toFixed(1)} kgCO₂e
Top category: ${summary.topCategory} (${summary.topCategoryPercent}%)
Trend: ${summary.trend} vs previous period
Biggest single entry: ${summary.biggestEntry.subcategory} (${summary.biggestEntry.kgCO2e.toFixed(1)} kg)
National average for my country: ${summary.nationalAverage.toFixed(1)} kgCO₂e

Give me 3 personalised insights and one action for this week.`;
}

/** Generates AI insights, with caching based on data hash. */
export async function generateInsightsAction(): Promise<{
  content: string;
  cached: boolean;
  generatedAt: Date;
}> {
  const userId = await requireUserId();
  const summary = await getCarbonSummary(userId, { weeks: 4 });

  const dataKey = JSON.stringify(summary);
  const dataHash = await hashString(dataKey);

  const cached = await prisma.insight.findFirst({
    where: { userId, dataHash },
    orderBy: { generatedAt: 'desc' },
  });

  if (cached) {
    return { content: cached.content, cached: true, generatedAt: cached.generatedAt };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const fallback = buildFallbackInsights(summary);
    await prisma.insight.create({ data: { userId, content: fallback, dataHash } });
    return { content: fallback, cached: false, generatedAt: new Date() };
  }

  const content = await withRetry((signal) =>
    generateGeminiContent(
      apiKey,
      { system: COACH_SYSTEM, prompt: buildUserPrompt(summary) },
      signal,
    ).catch(() => buildFallbackInsights(summary)),
  );

  await prisma.insight.create({ data: { userId, content, dataHash } });
  return { content, cached: false, generatedAt: new Date() };
}

function buildFallbackInsights(summary: Awaited<ReturnType<typeof getCarbonSummary>>): string {
  return `1. Your total footprint over 4 weeks is ${summary.totalKgCO2e.toFixed(1)} kgCO₂e, with ${summary.topCategory} as your largest category at ${summary.topCategoryPercent}%.

2. Your trend is ${summary.trend} compared to the previous period — ${summary.trend === 'down' ? 'great progress!' : 'there is room to improve.'}

3. Your biggest single entry was ${summary.biggestEntry.subcategory} at ${summary.biggestEntry.kgCO2e.toFixed(1)} kgCO₂e — targeting this area could yield quick wins.

**This week:** Try logging one alternative transport trip and compare the CO₂ difference.`;
}

/** Gets the latest cached insight for the authenticated user. */
export async function getLatestInsightAction() {
  const userId = await requireUserId();
  return prisma.insight.findFirst({
    where: { userId },
    orderBy: { generatedAt: 'desc' },
  });
}
