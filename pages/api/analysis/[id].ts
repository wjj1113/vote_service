import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const analysis = await prisma.politicalOrientation.findUnique({
      where: { 
        id: parseInt(String(id), 10) 
      },
      include: {
        recommendation: true
      }
    });

    if (!analysis) {
      return res.status(404).json({ message: '분석 결과를 찾을 수 없습니다.' });
    }

    // 후보자 정보 가져오기
    let candidateInfo = null;
    if (analysis.recommendation?.candidateId) {
      candidateInfo = await prisma.candidate.findUnique({
        where: { id: String(analysis.recommendation.candidateId) }
      });
    }

    const result = {
      politicalOrientation: {
        tendency: analysis.tendency,
        valueBase: analysis.valueBase,
        interests: analysis.interests,
        voteBase: analysis.voteBase
      },
      scores: analysis.scores,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
      recommendation: analysis.recommendation ? {
        ...analysis.recommendation,
        name: candidateInfo?.name,
        party: candidateInfo?.party,
        imageUrl: candidateInfo?.imageUrl || 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153692/gicho/thumbnail.100153692.JPG'
      } : null
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return res.status(500).json({ message: '분석 결과를 불러오는데 실패했습니다.' });
  }
} 