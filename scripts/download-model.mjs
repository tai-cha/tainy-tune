
import { pipeline, env } from '@xenova/transformers';
import path from 'path';
import fs from 'fs';

// Specify cache directory explicitely
const CACHE_DIR = path.resolve(process.cwd(), '.cache');

// Configure environment
env.allowLocalModels = false; // Force download during build
env.useBrowserCache = false;
env.cacheDir = CACHE_DIR;

console.log(`⬇️  Downloading model to ${CACHE_DIR}...`);

async function download() {
  try {
    // Initializing the pipeline triggers the download
    await pipeline('feature-extraction', 'Xenova/multilingual-e5-small');
    console.log('✅ Model downloaded successfully.');
  } catch (error) {
    console.error('❌ Failed to download model:', error);
    process.exit(1);
  }
}

download();
