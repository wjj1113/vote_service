import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getRecommendation(userInput: string) {
  const prompt = `다음 정책 선호도를 바탕으로 2025 대선 후보를 추천해주세요: ${userInput}`;
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 150,
  });
  return response.choices[0].message?.content?.trim() || '추천 결과를 생성할 수 없습니다.';
} 