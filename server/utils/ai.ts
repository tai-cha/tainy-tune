import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { z } from 'zod';
import { env } from '../../utils/env';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        mood_score: { type: SchemaType.INTEGER },
        tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        distortion_tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        advice: { type: SchemaType.STRING },
      },
      required: ['mood_score', 'tags', 'distortion_tags', 'advice'],
    },
  },
});

export const AnalysisSchema = z.object({
  mood_score: z.number().int().min(1).max(10).optional(),
  tags: z.array(z.string()),
  distortion_tags: z.array(z.string()),
  advice: z.string(),
});

export type AnalysisResult = z.infer<typeof AnalysisSchema>;

export async function analyzeJournal(content: string): Promise<AnalysisResult> {
  const prompt = `
    Analyze the following journal entry written by a user with ADHD traits.
    
    1. **Mood Score**: Estimate the user's mood on a scale of 1 (Worst) to 10 (Best).
    2. **Tags**: Generate 3-5 keywords summarizing the topic.
    3. **Cognitive Distortions**: Identify any cognitive distortions from the following list. If none, return an empty list. **Important: Return the Japanese term.**
       - All-or-nothing thinking (白黒思考)
       - Overgeneralization (過度の一般化)
       - Mental filter (心のフィルター)
       - Disqualifying the positive (マイナス化思考)
       - Jumping to conclusions (結論の飛躍)
       - Magnification/Minimization (拡大解釈・過小評価)
       - Emotional reasoning (感情的決めつけ)
       - Should statements (すべき思考)
       - Labeling (レッテル貼り)
       - Personalization (自己関連付け)
    4. **Advice**: Provide a short, empathetic, and actionable CBT-based advice or comment (1-2 sentences) in Japanese. Focus on validating the user's feelings and offering a different perspective if there are distortions.
    
    Journal Content:
    "${content}"
  `.trim();

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const json = JSON.parse(text);
    return AnalysisSchema.parse(json);
  } catch (error) {
    console.error('AI Analysis failed:', error);
    // Return safe fallback
    return {
      mood_score: 5,
      tags: [],
      distortion_tags: [],
      advice: '分析に失敗しました。',
    };
  }
}
