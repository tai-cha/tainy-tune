
import { pipeline, env } from '@xenova/transformers';
import path from 'path';

// Configure to prefer local execution but allow fallback
env.allowLocalModels = true;
env.allowRemoteModels = true; // Enable remote fallback
env.cacheDir = path.resolve(process.cwd(), '.cache');

// Input from arguments
const text = process.argv[2];

if (!text) {
  console.error('No text provided');
  process.exit(1);
}

const run = async () => {
  try {
    const extractor = await pipeline('feature-extraction', 'Xenova/multilingual-e5-small');
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    // Output valid JSON to stdout
    console.log(JSON.stringify(Array.from(output.data)));
  } catch (error) {
    console.error('Embedding failed:', error);
    process.exit(1);
  }
};

run();
