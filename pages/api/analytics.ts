import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 페이지별 방문자 수
    const pageViews = await prisma.userActivity.groupBy({
      by: ['page'],
      where: {
        action: 'view',
      },
      _count: {
        page: true,
      },
    });

    // 액션별 통계
    const actionStats = await prisma.userActivity.groupBy({
      by: ['action'],
      _count: {
        action: true,
      },
    });

    // 시간대별 활동
    const hourlyActivity = await prisma.userActivity.groupBy({
      by: ['createdAt'],
      _count: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // 최근 활동
    const recentActivity = await prisma.userActivity.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      pageViews,
      actionStats,
      hourlyActivity,
      recentActivity,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 