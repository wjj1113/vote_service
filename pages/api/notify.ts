import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { sendKakaoMessage } from '../../lib/kakao';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, pledge, status } = req.body;
    const notification = await prisma.notification.create({
      data: {
        userId,
        pledge,
        status,
      },
    });
    await sendKakaoMessage(userId, pledge, status);
    res.status(201).json(notification);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 