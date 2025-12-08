import { pipeline } from '@xenova/transformers';

// Singleton instance for the pipeline
let extractor: any = null;

export const getEmbedding = async (text: string): Promise<number[]> => {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/multilingual-e5-small');
  }

  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
};
