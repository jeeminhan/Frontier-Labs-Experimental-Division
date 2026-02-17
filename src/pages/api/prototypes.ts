export const prerender = false;

import type { APIRoute } from 'astro';
import { put, head, list } from '@vercel/blob';

const BLOB_NAME = 'prototypes.json';

// Fallback data matching src/data/prototypes.json
import defaultData from '../../data/prototypes.json';

async function readData() {
  try {
    // Check if blob exists
    const { blobs } = await list({ prefix: BLOB_NAME });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url);
      return await res.json();
    }
  } catch {
    // Blob store not available (local dev) — fall through to default
  }
  return structuredClone(defaultData);
}

async function writeData(data: Record<string, unknown>) {
  await put(BLOB_NAME, JSON.stringify(data, null, 2), {
    access: 'public',
    addRandomSuffix: false,
  });
}

export const GET: APIRoute = async () => {
  const data = await readData();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const current = await readData();

  for (const [key, values] of Object.entries(body)) {
    if (current[key]) {
      const v = values as Record<string, string>;
      if (v.prototypeUrl !== undefined) current[key].prototypeUrl = v.prototypeUrl;
      if (v.feedbackUrl !== undefined) current[key].feedbackUrl = v.feedbackUrl;
      if (v.slidesUrl !== undefined) current[key].slidesUrl = v.slidesUrl;
      if (v.videoUrl !== undefined) current[key].videoUrl = v.videoUrl;
    }
  }

  await writeData(current);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
