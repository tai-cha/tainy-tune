import { pipeline } from '@xenova/transformers';

// Singleton instance for the pipeline, unaffected by HMR
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
