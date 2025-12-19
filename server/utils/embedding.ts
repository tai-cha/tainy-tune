import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Worker script path - point to source directly in dev
const workerPath = path.join(process.cwd(), 'server', 'utils', 'embedding-worker.mjs');

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
