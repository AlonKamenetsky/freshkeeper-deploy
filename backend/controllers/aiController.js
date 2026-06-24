// controllers/aiController.js — Anthropic AI integration
// POST /ai/suggest-recipe  — AI-powered recipe suggestion based on pantry items
// POST /ai/food-tips       — AI food storage & freshness tips

const { successResponse, errorResponse } = require('../middleware/response');

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

async function callClaude(systemPrompt, userMessage) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured on server.');

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5-20251001',   // fast & cheap for embedded use
      max_tokens: 800,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Anthropic API error ${res.status}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || '';
}

// POST /ai/suggest-recipe
// Body: { items: [{ name, category, expirationDate }], preferences?: string }
async function suggestRecipe(req, res) {
  const { items, preferences } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0)
    return errorResponse(res, 400, 'VALIDATION_ERROR', 'items must be a non-empty array.', {});

  const itemList = items
    .map(i => `- ${i.name}${i.expirationDate ? ` (expires ${i.expirationDate})` : ''}`)
    .join('\n');

  const system = `You are a creative, practical chef assistant for a food inventory app called FreshKeeper.
Your goal is to help users avoid food waste by suggesting simple, realistic recipes using what they have.
Always prioritize items expiring soonest. Keep suggestions concise and practical.
Respond ONLY with valid JSON (no markdown fences, no extra text).`;

  const userMsg = `My current pantry items:\n${itemList}
${preferences ? `\nDietary preferences: ${preferences}` : ''}

Suggest 2 recipe ideas I can make. Respond with this exact JSON structure:
{
  "suggestions": [
    {
      "name": "Recipe Name",
      "description": "One sentence description",
      "keyIngredients": ["item1", "item2"],
      "estimatedTime": "20 minutes",
      "difficulty": "Easy",
      "tip": "A helpful food-saving tip"
    }
  ]
}`;

  try {
    const text = await callClaude(system, userMsg);
    let parsed;
    try {
      parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch {
      return errorResponse(res, 500, 'AI_PARSE_ERROR', 'AI returned invalid JSON.', { raw: text });
    }
    return successResponse(res, parsed);
  } catch (err) {
    return errorResponse(res, 500, 'AI_ERROR', err.message, {});
  }
}

// POST /ai/food-tips
// Body: { item: { name, category, storageType, expirationDate } }
async function foodTips(req, res) {
  const { item } = req.body;
  if (!item || !item.name)
    return errorResponse(res, 400, 'VALIDATION_ERROR', 'item.name is required.', {});

  const system = `You are a food safety and storage expert for FreshKeeper, a food inventory app.
Give practical, specific advice. Be concise — maximum 3 tips.
Respond ONLY with valid JSON (no markdown fences).`;

  const userMsg = `Give me storage and freshness tips for: ${item.name}
Category: ${item.category || 'unknown'}
Current storage: ${item.storageType || 'unknown'}
${item.expirationDate ? `Expiration date: ${item.expirationDate}` : ''}

Respond with this exact JSON:
{
  "tips": [
    { "title": "Short title", "detail": "One to two sentence tip." }
  ],
  "bestStorage": "fridge|freezer|pantry",
  "shelfLifeNote": "Brief note on typical shelf life"
}`;

  try {
    const text = await callClaude(system, userMsg);
    let parsed;
    try {
      parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch {
      return errorResponse(res, 500, 'AI_PARSE_ERROR', 'AI returned invalid JSON.', { raw: text });
    }
    return successResponse(res, parsed);
  } catch (err) {
    return errorResponse(res, 500, 'AI_ERROR', err.message, {});
  }
}

module.exports = { suggestRecipe, foodTips };
