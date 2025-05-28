import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

// 후보자별 이미지 URL 매핑
const candidateImageUrls: { [key: string]: string } = {
  '이재명': 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153692/gicho/thumbnail.100153692.JPG',
  '김문수': 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153710/gicho/thumbnail.100153710.JPG',
  '이준석': 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153689/gicho/thumbnail.100153689.JPG',
  '권영국': 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153725/gicho/thumbnail.100153725.JPG',
  '황교안': 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153708/gicho/thumbnail.100153708.JPG',
  '송진호': 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153726/gicho/thumbnail.100153726.JPG'
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    // 1. 정치 성향 분석 결과 가져오기
    const analysis = await prisma.politicalOrientation.findUnique({
      where: { 
        id: parseInt(String(id), 10) 
      }
    });

    if (!analysis) {
      return res.status(404).json({ message: '분석 결과를 찾을 수 없습니다.' });
    }

    // 2. 추천 결과 가져오기
    const recommendations = await prisma.recommendation.findMany({
      where: {
        orientationId: analysis.id
      },
      orderBy: {
        matchScore: 'desc'
      },
      take: 3 // 상위 3명의 후보자 반환
    });

    // 3. 후보자 정보 가져오기
    const candidateInfos = await Promise.all(
      recommendations.map(async (rec) => {
        if (rec.candidateId) {
          return await prisma.candidate.findUnique({
            where: { id: rec.candidateId },
            include: {
              policies: {
                orderBy: { order: 'asc' },
                take: 3
              }
            }
          });
        }
        return null;
      })
    );

    console.log('=== 분석 결과 데이터 ===');
    console.log('정치 성향:', analysis);
    console.log('추천 결과:', recommendations);
    console.log('후보자 정보:', candidateInfos);

    // 최종 응답 데이터 구성
    const responseData = {
      politicalOrientation: {
        tendency: analysis.tendency,
        valueBase: analysis.valueBase,
        interests: analysis.interests,
        voteBase: analysis.voteBase
      },
      scores: analysis.scores,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
      recommendations: recommendations.map((rec, index) => {
        const candidateInfo = candidateInfos[index];
        return {
          name: candidateInfo?.name || '',
          party: candidateInfo?.party || '',
          imageUrl: candidateInfo?.imageUrl || candidateImageUrls[candidateInfo?.name?.replace(/\s+/g, '')] || '/images/default-candidate.png',
          matchScore: rec.matchScore || 0,
          matchingPoints: rec.matchingPoints || [],
          differences: rec.differences || [],
          detailedAnalysis: rec.detailedAnalysis || {},
          policies: candidateInfo?.policies || [],
          recommendation: rec.recommendation || '',
          slogan: rec.recommendation || ''
        };
      })
    };

    console.log('=== 최종 반환 데이터 ===');
    console.log(JSON.stringify(responseData, null, 2));

    return res.status(200)
      .setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      .setHeader('Pragma', 'no-cache')
      .setHeader('Expires', '0')
      .json(responseData);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return res.status(500).json({ message: '분석 결과를 불러오는데 실패했습니다.' });
  }
} 