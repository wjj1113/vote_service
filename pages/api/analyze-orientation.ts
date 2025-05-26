// Vercel redeploy: prisma client reuse fix
// Vercel redeploy trigger: minor comment
import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';
import { prisma } from '../../lib/prisma';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { chatHistory } = req.body;

    // 1. 원본 입력 저장
    const rawInput = chatHistory;

    const prompt = `당신은 개인화된 정치 어시스턴트입니다.

아래는 사용자가 나눈 대화 기록입니다.
이 대화를 분석하여, 정치적 성향과 관심 주제를 객관적으로 요약해주세요.

🎯 요약 항목:
1. 정치 성향 (예: 진보 / 보수 / 중도 / 실용주의 등)
2. 가치 기준 (예: 공정성 / 경제 성장 / 복지 우선 등)
3. 주요 관심 정책 키워드 (최대 3개)
4. 투표 기준 (정당 / 후보자 능력 / 공약 중심 등)

✍️ 출력 형식:
정보가 부족하거나 모르는 값이 있으면 null, 빈 문자열, 빈 배열로 채워주세요.
반드시 아래 JSON만 반환하세요:
{
  "성향": "...",
  "가치기준": "...",
  "관심정책": [...],
  "투표기준": "..."
}

🧾 대화 기록:
${chatHistory}`;

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "당신은 정치 성향을 분석하는 전문가입니다. 사용자의 대화를 분석하여 정치적 성향을 객관적으로 요약해주세요."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const result = completion.data.choices[0].message?.content;
    console.log('OpenAI 응답 전체:', result);
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    // JSON 부분만 추출
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // 안내 메시지라면 사용자에게 안내
      return res.status(400).json({ error: '입력 정보가 부족합니다. 더 많은 정보를 입력해 주세요.', gptMessage: result });
    }
    const orientation = JSON.parse(jsonMatch[0]);
    // 각 필드가 없으면 기본값 할당
    const safeOrientation = {
      성향: orientation.성향 || '',
      가치기준: orientation.가치기준 || '',
      관심정책: orientation.관심정책 || [],
      투표기준: orientation.투표기준 || ''
    };

    // 2. 데이터베이스에 저장
    const savedOrientation = await prisma.politicalOrientation.create({
      data: {
        rawInput,
        tendency: safeOrientation.성향,
        valueBase: safeOrientation.가치기준,
        interests: safeOrientation.관심정책,
        voteBase: safeOrientation.투표기준,
      },
    });

    res.status(200).json(savedOrientation);
  } catch (error) {
    console.error('Error analyzing orientation:', error);
    res.status(500).json({ error: 'Failed to analyze orientation' });
  }
} 