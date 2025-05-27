import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

type ResponseData = {
  success: boolean;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { feedback } = req.body;

    if (!feedback || typeof feedback !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid feedback data' });
    }

    // DB에 저장
    await prisma.feedback.create({
      data: {
        content: feedback,
      },
    });

    return res.status(200).json({ success: true, message: 'Feedback received successfully' });
  } catch (error) {
    console.error('Error processing feedback:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
} 