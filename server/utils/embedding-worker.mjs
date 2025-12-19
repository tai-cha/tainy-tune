
import { pipeline, env } from '@xenova/transformers';

// Configure to ensure local execution
env.allowLocalModels = false;
env.useBrowserCache = false;

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
