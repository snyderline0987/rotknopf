#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { createWriteStream, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import FormData from 'form-data';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KEY = process.env.KIE_API_KEY;
const KIE = 'https://api.kie.ai';
const ASSETS_DIR = path.join(__dirname, 'assets');

async function uploadFile(filePath) {
  console.log(`\n📤 Uploading ${path.basename(filePath)}...`);
  const form = new FormData();
  form.append('file', readFileSync(filePath), path.basename(filePath));

  const res = await fetch(`${KIE}/api/v1/files/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KEY}`,
      ...form.getHeaders()
    },
    body: form
  });

  const json = await res.json();
  if (json.code !== 200 || !json.data?.url) throw new Error(`Upload failed: ${JSON.stringify(json)}`);
  console.log(`   ✅ Uploaded → ${json.data.url}`);
  return json.data.url;
}

async function createTask(model, input) {
  console.log(`\n📤 Submitting ${model}...`);
  const res = await fetch(`${KIE}/api/v1/jobs/createTask`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, input })
  });
  const json = await res.json();
  if (json.code !== 200 || !json.data?.taskId) throw new Error(JSON.stringify(json));
  console.log(`   ✅ Task ID: ${json.data.taskId}`);
  return json.data.taskId;
}

async function pollTask(taskId, label) {
  let delay = 5000;
  const start = Date.now();
  console.log(`\n⏳ Polling ${label} (taskId: ${taskId})`);
  while (Date.now() - start < 600_000) {
    await new Promise(r => setTimeout(r, delay));
    const res = await fetch(`${KIE}/api/v1/jobs/recordInfo?taskId=${taskId}`, {
      headers: { 'Authorization': `Bearer ${KEY}` }
    });
    const json = await res.json();
    const task = json.data || {};
    const state = task.state || task.status || '?';

    if (state === 'success') return task;
    if (['fail', 'error'].includes(state)) throw new Error(`Failed: ${JSON.stringify(task)}`);

    console.log(`   [${Math.round((Date.now()-start)/1000)}s] ${state}`);
    delay = Math.min(delay * 1.5, 15000);
  }
  throw new Error('Timeout');
}

function extractUrl(task) {
  const c = [
    task.resultUrl, task.videoUrl, task.imageUrl, task.url,
    ...(Array.isArray(task.resultUrls) ? task.resultUrls : []),
    ...(Array.isArray(task.imageUrls) ? task.imageUrls : [])
  ];
  return c.find(url => typeof url === 'string' && url.startsWith('http')) || null;
}

async function download(url, filename) {
  const outPath = path.join(ASSETS_DIR, filename);
  console.log(`\n💾 Downloading → ${filename}`);
  const res = await fetch(url);
  await pipeline(res.body, createWriteStream(outPath));
  const size = fs.statSync(outPath).size;
  console.log(`   ✅ Saved ${(size / 1024 / 1024).toFixed(1)} MB`);
}

async function processImageToVideo(imageFile, prompt, outputVideo) {
  const imagePath = path.join(ASSETS_DIR, imageFile);

  if (!fs.existsSync(imagePath)) {
    console.error(`❌ Image not found: ${imagePath}`);
    return null;
  }

  console.log(`\n🎬 Processing ${imageFile} → ${outputVideo}`);

  try {
    // Upload image first
    const imageUrl = await uploadFile(imagePath);

    // Create video from image
    const taskId = await createTask('kling/image-to-video', {
      prompt: prompt,
      imageUrl: imageUrl,
      duration: 5,
      aspectRatio: '16:9',
      mode: 'standard'
    });

    const result = await pollTask(taskId, outputVideo);
    const videoUrl = extractUrl(result);

    if (videoUrl) {
      await download(videoUrl, outputVideo);
      return outputVideo;
    } else {
      console.warn('⚠️  Video generation succeeded but no URL found');
      return null;
    }
  } catch (e) {
    console.warn('⚠️  Video failed:', e.message);
    return null;
  }
}

async function main() {
  console.log('🎥 ROTKNOPF Video Generation');
  console.log('================================');

  const videos = [
    {
      image: 'Gruener-Anzug.webp',
      output: 'hero_green.mp4',
      prompt: 'Subtle slow cinematic camera movement, gentle parallax zoom, premium atmosphere, fabric texture detail, professional craftsmanship, dark moody lighting, slow ambient motion'
    },
    {
      image: 'Blauer-Anzug.webp',
      output: 'hero_blue.mp4',
      prompt: 'Slow cinematic push-in, elegant fabric movement, bespoke tailoring quality, subtle depth of field change, premium luxury atmosphere, gentle camera drift'
    },
    {
      image: 'Stoff-Anzug.webp',
      output: 'fabric_showcase.mp4',
      prompt: 'Slow reveal of fabric texture and craftsmanship, cinematic lighting showing suit material quality, gentle ambient motion, premium tailoring atmosphere'
    }
  ];

  const results = [];
  for (const video of videos) {
    const result = await processImageToVideo(video.image, video.prompt, video.output);
    if (result) results.push(result);
  }

  console.log('\n🎉 Video Generation Complete!');
  console.log(`\n✅ Generated ${results.length}/${videos.length} videos:`);
  results.forEach(v => console.log(`   - ${v}`));

  if (results.length === 0) {
    console.log('\n⚠️  No videos generated. Will use static images as fallback.');
  }
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
