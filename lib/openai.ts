import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function getRecommendation(userInput: string) {
  const prompt = `다음 정책 선호도를 바탕으로 2025 대선 후보를 추천해주세요: ${userInput}`;
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt,
    max_tokens: 150,
  });
  return response.data.choices[0].text?.trim() || '추천 결과를 생성할 수 없습니다.';
} 