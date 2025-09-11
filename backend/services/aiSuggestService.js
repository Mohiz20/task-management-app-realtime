const { z } = require('zod');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral-nemo:latest';

// Strict JSON schema for model output
const SuggestSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().optional(),
  category: z.string().optional(), // e.g., Work, Personal, Urgent, Study
  priority: z.enum(['LOW','MEDIUM','HIGH']).optional(),
  subtasks: z.array(z.string()).optional()
});

const SYSTEM_INSTRUCTIONS = `
You help users plan tasks. 
Return STRICT JSON only, no markdown, no commentary.
JSON shape:
{
  "title": string,
  "description": string,
  "category": "Work" | "Personal" | "Urgent" | "Study" | "Misc",
  "priority": "LOW" | "MEDIUM" | "HIGH",
  "subtasks": string[]
}
Rules:
- Short, actionable title
- 2-5 practical subtasks max
- If unsure about category, use "Misc"
- Prefer MEDIUM priority unless text clearly implies HIGH or LOW
`;

function buildPrompt(context) {
  const c = (context || '').slice(0, 1500);
  return `${SYSTEM_INSTRUCTIONS}

Context:
${c}

Return JSON now:
`;
}

// Ollama returns streamed lines; we need to join .response chunks.
async function ollamaGenerate(prompt) {
  const r = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: true,
      // Make the model likely to emit just JSON:
      options: { temperature: 0.2 }
    })
  });

  if (!r.ok) {
    const text = await r.text().catch(()=>'');
    throw new Error(`Ollama error: ${r.status} ${text}`);
  }

  const reader = r.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buf = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    // Each line is JSON: { "response": "...", "done": false }
    for (const line of chunk.split('\n').filter(Boolean)) {
      try {
        const j = JSON.parse(line);
        if (j.response) buf += j.response;
      } catch { /* ignore partial lines */ }
    }
  }
  return buf;
}

// Extract first {...} JSON block from the raw text
function extractJsonBlock(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON object found in model output.');
  }
  return text.slice(start, end + 1);
}

async function suggestTaskFromContext(context) {
  const prompt = buildPrompt(context);
  const raw = await ollamaGenerate(prompt);
  const jsonStr = extractJsonBlock(raw);
  const parsed = JSON.parse(jsonStr);
  return SuggestSchema.parse(parsed);
}

module.exports = {
  suggestTaskFromContext,
  SuggestSchema
};
