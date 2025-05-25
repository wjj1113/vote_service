import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { email } = req.query;

      const subscription = await prisma.subscription.findFirst({
        where: {
          email: email as string,
        },
      });

      res.status(200).json({ isSubscribed: !!subscription });
    } catch (error) {
      console.error('Error checking subscription:', error);
      res.status(500).json({ error: 'Failed to check subscription' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 