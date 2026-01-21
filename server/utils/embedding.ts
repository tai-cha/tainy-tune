import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// Worker script path resolution
// In Dev: Point to source relative to CWD
// In Prod: Point to the copied file in .output/server/utils, relative to the entry script (.output/server/index.mjs)
const workerPath = import.meta.dev
  ? path.resolve(process.cwd(), 'server/utils/embedding-worker.mjs')
  : path.resolve(path.dirname(process.argv[1]), 'utils', 'embedding-worker.mjs');

export const getEmbedding = (text: string): Promise<number[]> => {
  return new Promise((resolve, reject) => {
    // Call the worker script
    execFile(process.execPath, [workerPath, text], (error, stdout, stderr) => {
      if (error) {
        console.error('Embedding worker error:', stderr);
        reject(error);
        return;
      }
      try {
        const embedding = JSON.parse(stdout.trim());
        resolve(embedding);
      } catch (e) {
        console.error('Failed to parse embedding output:', stdout);
        reject(new Error('Invalid embedding output'));
      }
    });
  });
};
