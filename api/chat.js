const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

function toInlineData(dataUrl) {
  const [meta, data] = dataUrl.split(',');
  const mime = meta?.match(/data:(.*?);base64/)?.[1] || 'image/png';
  return { inlineData: { mimeType: mime, data } };
}

function buildHistoryParts(history = []) {
  return history
    .filter((m) => m && (m.text || (m.images && m.images.length)))
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [
        ...(m.text ? [{ text: String(m.text) }] : []),
        ...((m.images || []).map((img) => toInlineData(img))),
      ],
    }));
}

async function callGemini({ apiKey, model, body }) {
  const url = `${GEMINI_BASE_URL}/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    const msg = data?.error?.message || JSON.stringify(data);
    throw new Error(`Gemini API ${response.status}: ${msg}`);
  }
  return data;
}

function extractOutput(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  let reply = '';
  const images = [];

  for (const part of parts) {
    if (part.text) reply += `${part.text}\n`;
    if (part.inlineData?.data && part.inlineData?.mimeType?.startsWith('image/')) {
      images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
    }
  }

  return { reply: reply.trim(), images };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY belum di-set di Vercel Environment Variables.' });
  }

  try {
    const {
      prompt = '',
      images = [],
      history = [],
      mode = 'chat',
      model = 'gemini-2.5-flash',
    } = req.body || {};
    const autoImageIntent = /(buat|generate|bikin).*(gambar|image|foto|ilustrasi)/i.test(prompt || '');
    const effectiveMode = mode === 'chat' && autoImageIntent ? 'image_generate' : mode;

    const imageParts = images.map((img) => toInlineData(img));
    const contents = [...buildHistoryParts(history)];
    const systemInstruction = {
      parts: [{ text: 'Kamu asisten cerdas berbahasa Indonesia. Jawaban harus jelas, natural, dan helpful seperti ChatGPT. Untuk kode, gunakan markdown code block.' }],
    };

    let modelToUse = model;
    let body = {};

    if (effectiveMode === 'image_generate') {
      modelToUse = 'gemini-2.0-flash-preview-image-generation';
      body = {
        contents: [{ role: 'user', parts: [{ text: `Generate a high-quality image based on this prompt: ${prompt}` }] }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
      };
    } else if (effectiveMode === 'image_edit') {
      modelToUse = 'gemini-2.0-flash-preview-image-generation';
      body = {
        contents: [{ role: 'user', parts: [{ text: `Edit this image with instruction: ${prompt}` }, ...imageParts] }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
      };
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: prompt }, ...imageParts],
      });

      body = {
        contents,
        systemInstruction,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      };
    }

    const data = await callGemini({ apiKey, model: modelToUse, body });
    const output = extractOutput(data);

    if (!output.reply && !output.images.length) {
      return res.status(200).json({ reply: 'Model tidak mengembalikan output. Coba ulangi prompt.', images: [] });
    }

    return res.status(200).json(output);
  } catch (error) {
    console.error('chat handler error', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
