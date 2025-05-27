import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 1. 기본 통계 데이터 조회
    const stats = await prisma.surveyStats.findUnique({
      where: { id: 1 }
    });

    if (!stats) {
      return res.status(200).json({
        totalResponses: 0,
        lastUpdated: new Date(),
        voteIntentCounts: {},
        partySupportCounts: {},
        keyIssuesCounts: {},
        regionCounts: {},
        ageGroupCounts: {},
        genderCounts: {}
      });
    }

    // 2. 상세 통계 데이터 조회 (최근 100개만)
    const orientations = await prisma.politicalOrientation.findMany({
      take: 100,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        recommendation: true
      }
    });

    // 3. 데이터 가공
    const processedStats = {
      ...stats,
      voteIntentCounts: safeJsonParse(stats.voteIntentCounts),
      partySupportCounts: safeJsonParse(stats.partySupportCounts),
      keyIssuesCounts: safeJsonParse(stats.keyIssuesCounts),
      regionCounts: safeJsonParse(stats.regionCounts),
      ageGroupCounts: safeJsonParse(stats.ageGroupCounts),
      genderCounts: safeJsonParse(stats.genderCounts)
    };

    // 4. 응답
    return res.status(200).json(processedStats);
  } catch (error) {
    console.error('Error fetching survey stats:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// 안전한 JSON 파싱 헬퍼 함수
function safeJsonParse(data: any): any {
  if (!data) return {};
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('JSON parse error:', e);
    return {};
  }
} 