import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { orientationId, candidateId, matched } = req.body;
    if (!orientationId || !candidateId || typeof matched !== 'boolean') {
      return res.status(400).json({ message: '필수 값 누락' });
    }
    const saved = await prisma.matchFeedback.create({
      data: {
        orientationId: Number(orientationId),
        candidateId: String(candidateId),
        matched: Boolean(matched),
      },
    });
    res.status(200).json(saved);
  } catch (error) {
    console.error('Error saving match:', error);
    res.status(500).json({ message: 'Error saving match response' });
  }
} 