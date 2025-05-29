import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const {
      name,
      contact,
      consultType,
      consultMemo,
      stage,
      concern,
      timePref,
    } = req.body;

    if (!name || !contact || !consultType) {
      return res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
    }

    const saved = await prisma.consultationRequest.create({
      data: {
        name,
        contact,
        consultType,
        consultMemo,
        stage,
        concern,
        timePref,
      },
    });
    return res.status(200).json({ ok: true, id: saved.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '서버 오류' });
  }
} 