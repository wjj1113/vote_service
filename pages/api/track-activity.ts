import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      sessionId,
      page,
      action,
      elementId,
      elementType,
      metadata,
    } = req.body;

    const userAgent = req.headers['user-agent'];
    const referrer = req.headers.referer;

    const activity = await prisma.userActivity.create({
      data: {
        sessionId,
        page,
        action,
        elementId,
        elementType,
        metadata,
        userAgent,
        referrer,
      },
    });

    res.status(200).json({ success: true, activity });
  } catch (error) {
    console.error('Error tracking activity:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 