import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (!ip) {
      return res.status(400).json({ message: 'IP address not found' });
    }

    // IP로 설문 기록 조회
    const existingSurvey = await prisma.surveySubmission.findFirst({
      where: {
        ipAddress: ip as string,
      },
    });

    if (existingSurvey) {
      return res.status(200).json({ 
        canSubmit: false,
        message: '이미 설문에 참여하셨습니다.',
        submittedAt: existingSurvey.createdAt
      });
    }

    return res.status(200).json({ 
      canSubmit: true,
      message: '설문 참여가 가능합니다.'
    });
  } catch (error) {
    console.error('Error checking survey limit:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 