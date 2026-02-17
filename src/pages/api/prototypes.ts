export const prerender = false;

import type { APIRoute } from 'astro';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dataPath = join(process.cwd(), 'src/data/prototypes.json');

function readData() {
  return JSON.parse(readFileSync(dataPath, 'utf-8'));
}

export const GET: APIRoute = async () => {
  const data = readData();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const current = readData();

  for (const [key, values] of Object.entries(body)) {
    if (current[key]) {
      const v = values as Record<string, string>;
      if (v.prototypeUrl !== undefined) current[key].prototypeUrl = v.prototypeUrl;
      if (v.feedbackUrl !== undefined) current[key].feedbackUrl = v.feedbackUrl;
      if (v.slidesUrl !== undefined) current[key].slidesUrl = v.slidesUrl;
      if (v.videoUrl !== undefined) current[key].videoUrl = v.videoUrl;
    }
  }

  writeFileSync(dataPath, JSON.stringify(current, null, 2) + '\n');
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
