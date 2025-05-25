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
    const { recommendation, match } = req.body;

    const savedMatch = await prisma.matchResponse.create({
      data: {
        recommendedCandidate: recommendation.추천후보자,
        recommendationReason: recommendation.추천사유,
        keyPolicies: recommendation.핵심공약요약,
        matched: match,
      },
    });

    res.status(200).json(savedMatch);
  } catch (error) {
    console.error('Error saving match:', error);
    res.status(500).json({ message: 'Error saving match response' });
  }
} 