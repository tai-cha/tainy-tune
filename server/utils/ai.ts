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

export type AnalysisResult = z.infer<typeof AnalysisSchema>;

export async function analyzeJournal(content: string): Promise<AnalysisResult> {
  const prompt = `
    Analyze the following journal entry written by a user with ADHD traits.
    
    1. **Mood Score**: Estimate the user's mood on a scale of 1 (Worst) to 10 (Best).
    2. **Tags**: Generate 3-5 keywords summarizing the topic.
    3. **Cognitive Distortions**: Identify ALL applicable cognitive distortions from the following list. It is common to have multiple distortions in a single entry; list all that apply. If none, return an empty list. **Important: Return the corresponding KEY strings.**
       - all_or_nothing (All-or-nothing thinking / 白黒思考)
       - overgeneralization (Overgeneralization / 過度の一般化)
       - mental_filter (Mental filter / 心のフィルター)
       - disqualifying_positive (Disqualifying the positive / マイナス化思考)
       - jumping_conclusions (Jumping to conclusions / 結論の飛躍 - general)
       - mind_reading (Mind reading / 心の読みすぎ)
       - fortune_telling (Fortune telling / 先読みの誤り)
       - magnification_minimization (Magnification/Minimization / 拡大解釈・過小評価)
       - emotional_reasoning (Emotional reasoning / 感情的決めつけ)
       - should_statements (Should statements / すべき思考)
       - labeling (Labeling / レッテル貼り)
       - personalization (Personalization / 自己関連付け)
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

export const AnalysisSchema = z.object({
  mood_score: z.number().int().min(1).max(10).optional(),
  tags: z.array(z.string()),
  distortion_tags: z.array(z.enum([
    'all_or_nothing',
    'overgeneralization',
    'mental_filter',
    'disqualifying_positive',
    'jumping_conclusions',
    'mind_reading',
    'fortune_telling',
    'magnification_minimization',
    'emotional_reasoning',
    'should_statements',
    'labeling',
    'personalization',
  ])),
  advice: z.string(),
});
