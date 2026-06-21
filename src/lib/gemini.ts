const GEMINI_API_BASE =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

/** Calls Google Gemini generateContent API. */
export async function generateGeminiContent(
  apiKey: string,
  options: { system: string; prompt: string },
  signal?: AbortSignal,
): Promise<string> {
  const response = await fetch(GEMINI_API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: options.system }] },
      contents: [{ parts: [{ text: options.prompt }] }],
    }),
    ...(signal ? { signal } : {}),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${detail}`);
  }

  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error('Gemini returned empty content');
  return text;
}
