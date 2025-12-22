import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { z } from 'zod';
import { env } from '~/utils/env';

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
        fact: { type: SchemaType.STRING },
        emotion: { type: SchemaType.STRING },
      },
      required: ['mood_score', 'tags', 'distortion_tags', 'advice', 'fact', 'emotion'],
    },
  },
});

export type AnalysisResult = z.infer<typeof AnalysisSchema>;

export async function analyzeJournal(content: string, contextJournals: any[] = []): Promise<AnalysisResult & { is_analysis_failed: boolean }> {
  // Format context for prompt
  const contextString = contextJournals.length > 0
    ? `
    ### Relevant Past Journals (Context):
    ${contextJournals.map((j, i) => `
    [${i + 1}] Date: ${j.created_at}
    Content: ${j.content}
    Advice Given: ${j.advice}
    `).join('\n')}
    
    Instruction: Consider these past entries. If the user is repeating a pattern or has made progress, mention it in the advice.
    `
    : '';

  const prompt = `
    # Role
    You are a professional CBT (Cognitive Behavioral Therapy) partner. Your objective is not to correct "errors," but to provide a metacognitive mirror. Assume the user's thoughts are rational attempts to process their reality and past experiences.

    Analyze the following journal entry.

    ${contextString}

    1. **Mood Score**: Estimate the user's mood on a scale of 1 (Worst) to 10 (Best).
    2. **Tags**: Generate 3-5 keywords summarizing the topic.
    3. **Cognitive Distortions**: Identify ALL applicable cognitive distortions from the specific list below.
       - *Perspective*: View these not just as "distortions" but as "specific cognitive lenses" the user is currently using.
       - List: all_or_nothing, overgeneralization, mental_filter, disqualifying_positive, jumping_conclusions, mind_reading, fortune_telling, magnification_minimization, emotional_reasoning, should_statements, labeling, personalization.
    4. **Fact Decomposition**: Extract ONLY the objective facts (events, actions, situations) from the content. Remove any subjective interpretation or emotions.
    5. **Emotion/Thought Decomposition**: Extract the user's thoughts, interpretations, and feelings about the facts.
    6. **Advice**: Provide a short, empathetic, and actionable CBT-based advice (1-2 sentences) in Japanese.
       - *Validation*: Always validate the internal logic of the user's thoughts first.
       - *Inquiry*: Instead of refuting, offer a gentle inquiry that expands the user's perspective beyond their current single focus.
       - If similar past patterns are found in the provided Context, refer to them gently to encourage insight.
    
    Journal Content:
    "${content}"
  `.trim();

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const json = JSON.parse(text);
    const data = AnalysisSchema.parse(json);
    return { ...data, is_analysis_failed: false };
  } catch (error) {
    console.error('AI Analysis failed:', error);
    // Return safe fallback
    return {
      mood_score: 5,
      tags: [],
      distortion_tags: [],
      advice: '分析に失敗しました。',
      fact: '',
      emotion: '',
      is_analysis_failed: true,
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
  fact: z.string(),
  emotion: z.string(),
});
