import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

// 전역 Prisma 클라이언트 인스턴스 생성
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // 중복 제거를 위해 distinct 사용
      const candidates = await prisma.candidate.findMany({
        distinct: ['name'],
        include: {
          policies: {
            orderBy: {
              order: 'asc'
            }
          }
        }
      });

      if (!candidates || !Array.isArray(candidates)) {
        return res.status(200).json([]);
      }

      // 이미지 URL 매핑
      const candidateImageUrls: { [key: string]: string } = {
        '이재명': 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153692/gicho/thumbnail.100153692.JPG',
        '김문수': 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153710/gicho/thumbnail.100153710.JPG',
        '이준석': 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153689/gicho/thumbnail.100153689.JPG',
        '권영국': 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153725/gicho/thumbnail.100153725.JPG',
        '황교안': 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153708/gicho/thumbnail.100153708.JPG',
        '송진호': 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153722/gicho/thumbnail.100153722.JPG'
      };

      // 이미지 URL 추가
      const candidatesWithImages = candidates.map(candidate => ({
        ...candidate,
        imageUrl: candidateImageUrls[candidate.name.replace(/\s/g, '')] || null
      }));

      return res.status(200).json(candidatesWithImages);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      // 에러 발생 시 빈 배열 반환
      return res.status(200).json([]);
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 