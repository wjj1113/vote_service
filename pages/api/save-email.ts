import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, message: '이메일이 필요합니다.' });
  }
  try {
    // 중복 저장 방지: 이미 있으면 무시
    const existing = await prisma.email.findUnique({ where: { address: email } });
    if (!existing) {
      await prisma.email.create({ data: { address: email } });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('이메일 저장 오류:', error);
    return res.status(500).json({ success: false, message: '서버 오류' });
  }
} 