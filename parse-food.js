/* Ironlog — food parser.
 *
 * The phone posts { text } and gets back an array of food items. The
 * Anthropic key lives in Netlify's environment and never leaves the
 * server, which is the whole reason this file exists rather than
 * calling the API straight from index.html.
 *
 * Set ANTHROPIC_API_KEY under Site configuration -> Environment variables.
 */

const MODEL = 'claude-haiku-4-5';
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const SYSTEM = `You convert a short description of food eaten into structured data.

Return ONLY a JSON array. No prose, no markdown fences, no explanation.

Each element:
{
  "name":    string,  short item name
  "serving": string,  the portion as eaten, e.g. "200 g" or "1 medium"
  "meal":    one of ${MEALS.map(m => '"' + m + '"').join(', ')},
  "kcal":    number,
  "protein": number (grams),
  "carbs":   number (grams),
  "fats":    number (grams),
  "fiber":   number (grams)
}

Rules:
- One element per distinct food. Split composite meals into their parts.
- If no portion is stated, assume a typical adult serving and say so in "serving".
- Weights are cooked weight unless the text says otherwise.
- Guess the meal from any time words; otherwise use "Snacks".
- Numbers only in the numeric fields. Never null, never a string, never a range.
- If the text describes no food at all, return [].`;

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { ...headers, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'POST only' }) };
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set on the site' }) };
  }

  let text;
  try {
    text = String(JSON.parse(event.body || '{}').text || '').trim();
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'bad JSON' }) };
  }
  if (!text) return { statusCode: 400, headers, body: JSON.stringify({ error: 'no text' }) };
  if (text.length > 1000) text = text.slice(0, 1000);

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1200,
        system: SYSTEM,
        messages: [
          { role: 'user', content: text },
          // Prefilling the opening bracket stops the model wrapping the
          // array in a sentence, so the response parses on the first try.
          { role: 'assistant', content: '[' },
        ],
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error('anthropic %d: %s', r.status, detail);
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'upstream ' + r.status }) };
    }

    const data = await r.json();
    const raw = '[' + (data.content || [])
      .filter(b => b.type === 'text').map(b => b.text).join('');

    let items;
    try {
      items = JSON.parse(raw);
    } catch {
      // Salvage the array if anything trailed after it.
      const m = raw.match(/\[[\s\S]*\]/);
      if (!m) throw new Error('unparseable: ' + raw.slice(0, 200));
      items = JSON.parse(m[0]);
    }
    if (!Array.isArray(items)) throw new Error('not an array');

    const n = v => { const x = Number(v); return Number.isFinite(x) && x >= 0 ? Math.round(x * 10) / 10 : 0; };
    const clean = items.slice(0, 25).map(it => ({
      name: String(it.name || 'Item').slice(0, 80),
      serving: String(it.serving || '').slice(0, 40),
      meal: MEALS.includes(it.meal) ? it.meal : 'Snacks',
      kcal: n(it.kcal), protein: n(it.protein), carbs: n(it.carbs),
      fats: n(it.fats), fiber: n(it.fiber),
    })).filter(it => it.kcal || it.protein || it.carbs || it.fats);

    return { statusCode: 200, headers, body: JSON.stringify(clean) };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: String(e.message || e) }) };
  }
};
