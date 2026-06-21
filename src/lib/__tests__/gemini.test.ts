import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateGeminiContent } from '../gemini';

describe('generateGeminiContent', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns text from Gemini response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [{ content: { parts: [{ text: '  Insight text  ' }] } }],
          }),
      }),
    );

    const text = await generateGeminiContent('test-key', {
      system: 'Coach',
      prompt: 'Summarise my footprint',
    });
    expect(text).toBe('Insight text');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('gemini-flash-latest'),
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-goog-api-key': 'test-key' }),
      }),
    );
  });

  it('throws on API error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 403, text: () => Promise.resolve('Forbidden') }),
    );
    await expect(
      generateGeminiContent('bad-key', { system: 'Coach', prompt: 'Hi' }),
    ).rejects.toThrow('Gemini API error');
  });
});
