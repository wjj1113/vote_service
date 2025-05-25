import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const submissions = await prisma.surveySubmission.findMany();
    const totalResponses = submissions.length;
    const lastUpdated = submissions.length > 0 ? submissions[submissions.length - 1].createdAt : null;

    // 집계 함수
    const countBy = (key: string) => {
      const counts: Record<string, number> = {};
      submissions.forEach((s: any) => {
        const value = s.formData && (s.formData as any)[key];
        if (value) {
          counts[value] = (counts[value] || 0) + 1;
        }
      });
      return counts;
    };

    // 투표 의향
    const voteIntentCounts = countBy('vote_intent');
    // 지지 정당
    const supportedPartyCounts = countBy('supported_party');
    // 주요 이슈
    const keyIssueCounts = countBy('key_issue');
    // 지역
    const regionCounts = countBy('region');
    // 연령대
    const ageCounts = countBy('age_group');
    // 성별
    const genderCounts = countBy('gender');

    res.status(200).json({
      totalResponses,
      lastUpdated,
      voteIntentCounts,
      supportedPartyCounts,
      keyIssueCounts,
      regionCounts,
      ageCounts,
      genderCounts,
    });
  } catch (error) {
    console.error('Error in survey-stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 