import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { candidateId, ageGroup, region, gender } = req.body;
    const voteIntent = await prisma.voteIntent.create({
      data: {
        candidateId,
        ageGroup,
        region,
        gender,
      },
    });
    res.status(201).json(voteIntent);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 