import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { email, type, subscription } = req.body;

      // 구독 정보 저장
      const subscriptionData = await prisma.subscription.create({
        data: {
          type,
          email: type === 'email' ? email : undefined,
          subscription: type === 'push' ? subscription : undefined,
        },
      });

      res.status(201).json(subscriptionData);
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 