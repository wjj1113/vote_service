import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { name } = req.query;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ success: false, message: 'Candidate name is required' });
  }

  try {
    // DB에서 모든 후보자 이름을 가져와서 공백 제거 후 비교
    const candidates = await prisma.candidate.findMany({
      select: {
        id: true,
        name: true,
        party: true,
        policies: {
          select: {
            id: true,
            title: true,
            summary: true,
            categories: true,
            order: true
          }
        }
      }
    });
    const reqName = name.replace(/\s/g, '');
    const candidate = candidates.find(c => c.name.replace(/\s/g, '') === reqName);

    if (!candidate) {
      return res.status(404).json({ 
        success: false, 
        message: 'Candidate not found',
        searchName: name 
      });
    }

    return res.status(200).json({
      success: true,
      candidate
    });
  } catch (error) {
    console.error('Error fetching candidate:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch candidate information' 
    });
  }
} 