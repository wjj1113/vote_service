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
    const { orientationId } = req.body;

    // 1. 정치 성향 데이터 조회
    const orientation = await prisma.politicalOrientation.findUnique({
      where: { id: orientationId },
    });

    if (!orientation) {
      throw new Error('Political orientation not found');
    }

    // 2. 후보자 데이터 조회
    const candidates = await prisma.candidate.findMany({
      include: {
        policies: true,
      },
    });

    const prompt = `당신은 대선 후보 분석 전문 정치봇입니다.

사용자의 정치 성향과 관심사를 기반으로,
이번 대선에서 가장 잘 맞는 후보자를 추천해주세요.

📌 사용자 정보:
${JSON.stringify({
  성향: orientation.tendency,
  가치기준: orientation.valueBase,
  관심정책: orientation.interests,
  투표기준: orientation.voteBase,
}, null, 2)}

📌 후보자 정보:
${JSON.stringify(candidates.map(c => ({
  이름: c.name,
  정당: c.party,
  공약: c.policies.map(p => p.title),
})), null, 2)}

✍️ 출력 형식:
{
  "추천후보자": "홍길동",
  "추천사유": "당신은 실용주의와 경제정책을 중시하고, 청년 일자리 문제에 관심이 많습니다. 이 후보는 청년 일자리 공약에 강점을 가지고 있으며, 중도 실용주의 성향을 가지고 있어 잘 맞습니다.",
  "핵심공약요약": [
    "청년 맞춤형 일자리 50만 개 창출",
    "디지털 인재 30만 양성 계획",
    "소득주도성장 폐기 후 노동시장 유연화"
  ]
}`;

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "당신은 후보자 추천 전문가입니다. 사용자의 성향과 관심사를 고려하여 가장 적합한 후보자를 추천해주세요."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const result = completion.data.choices[0].message?.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    // JSON 부분만 추출
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('OpenAI 응답에서 JSON을 찾을 수 없습니다.');
    }
    const recommendation = JSON.parse(jsonMatch[0]);

    // 3. 추천 결과 저장
    const savedRecommendation = await prisma.recommendation.create({
      data: {
        orientationId: orientation.id,
        candidate: recommendation.추천후보자,
        reason: recommendation.추천사유,
        policies: recommendation.핵심공약요약,
      },
    });

    res.status(200).json(savedRecommendation);
  } catch (error) {
    console.error('Error getting recommendation:', error);
    res.status(500).json({ error: 'Failed to get recommendation' });
  }
} 