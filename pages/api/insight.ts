import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. 오늘 날짜(00:00) 기준 인사이트가 이미 DB에 있으면 반환
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const existing = await prisma.insight.findFirst({
    where: { createdAt: { gte: today } },
    orderBy: { createdAt: 'desc' }
  });
  if (existing) {
    return res.status(200).json({ insight: existing.content });
  }

  // 2. 대시보드 데이터 fetch
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const dashboardRes = await fetch(`${baseUrl}/api/dashboard`);
  const dashboardData = await dashboardRes.json();

  // 3. 프롬프트 생성
  const prompt = `\n아래는 오늘의 여론조사 대시보드 데이터입니다.\n- 총 응답수: ${dashboardData.totalResponses}\n- 투표 의향: ${dashboardData.voteIntentPercentage}%\n- 1위 정당: ${dashboardData.topPartyLabel} (${dashboardData.topPartyPercentage}%)\n- 주요 이슈 분포: ${JSON.stringify(dashboardData.keyIssues)}\n이 데이터를 바탕으로 오늘의 주요 인사이트/특징을 3~5줄로 요약해줘. (정치적 중립, 통계적 해석 위주)`;

  // 4. OpenAI turbo-3.5 호출
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: '너는 데이터 분석가야.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 300,
    temperature: 0.7,
  });

  const insight = completion.choices[0].message?.content || '분석 결과를 가져오지 못했습니다.';

  // 5. DB에 저장
  await prisma.insight.create({ data: { content: insight } });

  // 6. 결과 반환
  res.status(200).json({ insight });
} 