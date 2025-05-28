import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

// 후보자별 이미지 URL 매핑
const candidateImageUrls: { [key: string]: string } = {
  '이재명': 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153692/gicho/thumbnail.100153692.JPG',
  '김문수': 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153710/gicho/thumbnail.100153710.JPG',
  '이준석': 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153689/gicho/thumbnail.100153689.JPG',
  '권영국': 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153725/gicho/thumbnail.100153725.JPG',
  '황교안': 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153708/gicho/thumbnail.100153708.JPG',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name } = req.query;

  try {
    const candidate = await prisma.candidate.findFirst({
      where: { 
        name: String(name)
      },
      include: {
        policies: true
      }
    });

    if (!candidate) {
      return res.status(404).json({ 
        success: false, 
        message: '후보자를 찾을 수 없습니다.' 
      });
    }

    // 이미지 URL이 없는 경우 매핑된 URL 사용
    const imageUrl = candidate.imageUrl || candidateImageUrls[candidate.name] || '/images/default-candidate.png';

    return res.status(200).json({
      success: true,
      candidate: {
        ...candidate,
        imageUrl,
        policies: candidate.policies || []
      }
    });
  } catch (error) {
    console.error('Error fetching candidate:', error);
    return res.status(500).json({ 
      success: false, 
      message: '후보자 정보를 불러오는데 실패했습니다.' 
    });
  }
} 