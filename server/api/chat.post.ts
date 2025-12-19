import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEmbedding } from '@server/utils/embedding';
import { searchSimilarJournals } from '@server/utils/retrieval';
import { env } from '~/utils/env';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { message } = body;

  if (!message || typeof message !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Message is required',
    });
  }

  try {
    // 1. Vectorize User Input
    const queryEmbedding = await getEmbedding(message);

    // 2. Retrieve Context (RAG)
    const similarJournals = await searchSimilarJournals(queryEmbedding);
    const contextText = similarJournals
      .map((journal) => `- ${journal.content}`)
      .join('\n');

    // 3. Construct Prompt
    const prompt = `
You are a helpful AI assistant for a personal life log app.
The user is asking a question about their own past records.
Use the following retrieved journal entries as context to answer the user's question.
If the context doesn't contain the answer, say so politely.

Context (Past Journals):
${contextText}

User Query:
${message}
    `.trim();

    // 4. Generate Response
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return {
      reply: response,
      context: similarJournals, // Optional: return sources for transparency
    };
  } catch (error: any) {
    console.error('Error in chat API:', error);

    // Extract detailed error info if available
    const status = error.status || error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    throw createError({
      statusCode: status,
      statusMessage: status === 429 ? 'Too Many Requests' : 'Server Error',
      message: message,
      data: error, // useful for debugging on client
    });
  }
});
