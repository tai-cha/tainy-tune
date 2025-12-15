import { pipeline, env } from '@xenova/transformers';

// Configuration to prevent WASM fallback and ensure local execution
env.allowLocalModels = false; // Allow downloading from HF Hub if not found (default behavior)
env.useBrowserCache = false; // We are in Node.js

const globalAny: any = global;
let extractor = globalAny._extractor || null;

export const getEmbedding = async (text: string): Promise<number[]> => {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/multilingual-e5-small');
    globalAny._extractor = extractor;
  }

  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
};
