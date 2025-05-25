import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const filePath = path.join(process.cwd(), 'db_list_clean.json');
      const jsonData = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(jsonData);
      
      // 후보자 데이터 변환
      const candidates = data.candidates.map((candidate: any, index: number) => ({
        id: index + 1,
        name: candidate.name,
        party: candidate.party,
        policies: candidate.pledges.map((pledge: any) => ({
          id: `${candidate.name}-${pledge.rank}`,
          order: pledge.rank,
          title: pledge.title,
          categories: pledge.categories,
          goal: pledge.goal,
          implementation: pledge.methods.join('\n'),
          duration: pledge.period,
          budget: pledge.funding,
          summary: pledge.goal.split('.')[0]
        }))
      }));

      res.status(200).json(candidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      res.status(500).json({ error: 'Failed to fetch candidates' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 