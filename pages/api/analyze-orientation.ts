// Vercel redeploy: supabase-js migration
// Vercel redeploy trigger: minor comment
import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';
import { createClient } from '@supabase/supabase-js';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { chatHistory } = req.body;

    // 1. 원본 입력 저장
    const rawInput = chatHistory;

    const prompt = `당신은 개인화된 정치 어시스턴트입니다.\n\n아래는 사용자가 나눈 대화 기록입니다.\n이 대화를 분석하여, 정치적 성향과 관심 주제를 객관적으로 요약해주세요.\n\n🎯 요약 항목:\n1. 공유형:\n  - 유형 (예: 정치 현생 회피형 등)\n  - 정치 코드 (예: 실용주의 + 정치개혁 등)\n  - 관심사 (최대 3개, 이모지 포함)\n  - 찔린 한마디 (짧은 문장)\n  - AI 반응 (짧은 문장)\n2. 저장형:\n  - 정치 성향 (예: 진보 / 보수 / 중도 / 실용주의 등)\n  - 가치 기준 (예: 공정성 / 경제 성장 / 복지 우선 등)\n  - 주요 관심 정책 키워드 (최대 3개)\n  - 투표 기준 (정당 / 후보자 능력 / 공약 중심 등)\n\n✍️ 출력 형식:\n정보가 부족하거나 모르는 값이 있으면 null, 빈 문자열, 빈 배열로 채워주세요. 반드시 아래 JSON만 반환하세요:\n{\n  "공유형": {\n    "유형": "...",\n    "정치 코드": "...",\n    "관심사": [ ... ],\n    "찔린 한마디": "...",\n    "AI 반응": "..."\n  },\n  "저장형": {\n    "성향": "...",\n    "가치기준": "...",\n    "관심정책": [ ... ],\n    "투표기준": "..."\n  }\n}\n\n🧾 대화 기록:\n${chatHistory}`;

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "당신은 정치 성향을 분석하는 전문가입니다. 사용자의 대화를 분석하여 정치적 성향을 객관적으로 요약해주세요."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const result = completion.data.choices[0].message?.content;
    console.log('OpenAI 응답 전체:', result);
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    // JSON 부분만 추출
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(400).json({ error: '입력 정보가 부족합니다. 더 많은 정보를 입력해 주세요.', gptMessage: result });
    }
    const parsed = JSON.parse(jsonMatch[0]);
    const shared = parsed.공유형 || {};
    const saved = parsed.저장형 || {};
    const safeOrientation = {
      성향: saved.성향 || '',
      가치기준: saved.가치기준 || '',
      관심정책: saved.관심정책 || [],
      투표기준: saved.투표기준 || ''
    };
    const now = new Date().toISOString();
    // Supabase에 데이터 저장 (저장형만 저장)
    const { data, error } = await supabase
      .from('PoliticalOrientation')
      .insert([
        {
          rawInput,
          tendency: safeOrientation.성향,
          valueBase: safeOrientation.가치기준,
          interests: safeOrientation.관심정책,
          voteBase: safeOrientation.투표기준,
          createdAt: now,
          updatedAt: now,
        },
      ])
      .select();
    if (error) {
      throw error;
    }
    // 공유형/저장형 모두 응답에 포함
    res.status(200).json({ ...data[0], 공유형: shared, 저장형: saved });
  } catch (error) {
    console.error('Error analyzing orientation:', error);
    res.status(500).json({ error: 'Failed to analyze orientation' });
  }
} 