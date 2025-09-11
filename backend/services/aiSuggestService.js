const { z } = require('zod');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral-nemo:latest';

// Strict JSON schema for model output
const SuggestSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().optional(),
  category: z.string().optional(), // e.g., Work, Personal, Urgent, Study
  priority: z.enum(['LOW','MEDIUM','HIGH']).optional(),
  estimatedMinutes: z.number().int().positive().optional(), // estimated time in minutes
  dueDate: z.string().optional(), // ISO date string if due date can be inferred
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
  "estimatedMinutes": number, // estimated time in minutes (e.g., 30, 60, 120)
  "dueDate": string, // ISO date string (e.g., "2024-12-31T23:59:59Z") if deadline mentioned
  "subtasks": string[]
}
Rules:
- Short, actionable title (max 120 chars)
- 2-5 practical subtasks max
- If unsure about category, use "Misc"
- Prefer MEDIUM priority unless text clearly implies HIGH or LOW
- For estimatedMinutes: analyze task complexity and provide realistic time estimate
  * Simple tasks (config, minor fixes): 15-30 minutes
  * Medium tasks (feature development, testing): 60-180 minutes  
  * Complex tasks (architecture, research): 240+ minutes
- For dueDate: only include if context mentions specific deadline, timeline, or urgency
  * "by Friday", "end of week", "tomorrow", "next month" etc.
  * Calculate relative to current date when possible
  * Use ISO format with time set to end of day (23:59:59)
- Leave estimatedMinutes and dueDate undefined if not mentioned or unclear
`;

function buildPrompt(context) {
  const c = (context || '').slice(0, 1500);
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
  return `${SYSTEM_INSTRUCTIONS}

Current Date: ${currentDate} (${currentDay})

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
