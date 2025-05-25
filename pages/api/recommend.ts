import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getRecommendation } from '../../lib/openai';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { interests, ageGroup, region } = req.body;

      // 1. 관심 분야와 관련된 정책 찾기
      const policies = await prisma.policy.findMany({
        where: {
          categories: {
            hasSome: interests,
          },
        },
        include: {
          candidate: true,
        },
      });

      // 2. 연령대와 지역에 따른 투표 의향 데이터 분석
      const voteIntents = await prisma.voteIntent.findMany({
        where: {
          ageGroup,
          region,
        },
        include: {
          candidate: true,
        },
      });

      // 3. 정책 추천 로직
      const recommendationInput = {
        interests,
        ageGroup,
        region,
        policies: policies.map((policy) => ({
          title: policy.title,
          summary: policy.summary,
          candidate: policy.candidate.name,
          party: policy.candidate.party,
        })),
        voteIntents: voteIntents.map((intent) => ({
          candidate: intent.candidate.name,
          party: intent.candidate.party,
        })),
      };

      // 4. OpenAI를 사용한 맞춤형 추천 생성
      const recommendation = await getRecommendation(JSON.stringify(recommendationInput));

      res.status(200).json({ recommendation });
    } catch (error) {
      console.error('Error generating recommendation:', error);
      res.status(500).json({ error: 'Failed to generate recommendation' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 