import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { prisma } from '../../lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed',
      message: 'POST 메소드만 허용됩니다.'
    });
  }

  try {
    const { orientationId } = req.body;
    console.log('Received orientationId:', orientationId);

    if (!orientationId) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required parameter',
        message: 'orientationId는 필수 파라미터입니다.'
      });
    }

    // 1. 정치 성향 데이터 조회
    const orientation = await prisma.politicalOrientation.findUnique({
      where: { id: Number(orientationId) }
    });

    if (!orientation) {
      return res.status(404).json({ 
        success: false,
        error: 'Orientation not found',
        message: '해당 정치 성향 정보를 찾을 수 없습니다.'
      });
    }

    // 2. DB에서 후보자 목록 가져오기 및 이름 리스트 추출
    const candidates = await prisma.candidate.findMany({ select: { name: true } });
    const candidateNames = candidates.map((c: { name: string }) => c.name);

    // 3. 프롬프트 생성
    const candidateRecommendationPrompt = {
      role: "당신은 정치 성향 분석 및 후보자 추천 전문가입니다.",
      task: `아래 정치 성향 분석 결과를 참고하여, 반드시 다음 후보자명 중에서 가장 적합한 후보자 한 명을 추천하세요.\n\n후보자명 리스트: ${candidateNames.map((n: string) => `"${n}"`).join(", ")}\n\n반드시 위 후보자명 중에서만 name 값을 선택하세요.\n\n아래 output 구조에 맞춰 모든 필드를 빠짐없이 채워서 반환하세요. 다른 설명이나 추가 JSON은 반환하지 마세요.`,
      output: `{
        "name": "후보자 이름",
        "party": "정당",
        "imageUrl": "이미지 URL (없으면 빈 문자열)",
        "matchScore": 0-100,
        "recommendation": "추천 이유",
        "matchingPoints": ["정책1", "정책2"],
        "differences": ["차이점1", "차이점2"],
        "detailedAnalysis": {
          "policyMatch": { "score": 0-100, "reason": "정책 일치도 분석" },
          "valueMatch": { "score": 0-100, "reason": "가치관 일치도 분석" },
          "demographicMatch": { "score": 0-100, "reason": "지역/계층 특성 분석" },
          "leadershipMatch": { "score": 0-100, "reason": "리더십 스타일 분석" }
        }
      }`
    };

    // 3. GPT로 추천 생성
    const recommendCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: candidateRecommendationPrompt.role },
        { role: "user", content: `${candidateRecommendationPrompt.task}\n\n정치 성향 분석 결과:\n${JSON.stringify(orientation, null, 2)}\n\n${candidateRecommendationPrompt.output}` }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const result = recommendCompletion.choices[0].message?.content;
    if (!result) {
      throw new Error('OpenAI로부터 응답을 받지 못했습니다.');
    }

    // JSON 부분만 추출
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('OpenAI 응답에서 JSON을 찾을 수 없습니다.');
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (error) {
      throw new Error('OpenAI 응답의 JSON 파싱에 실패했습니다.');
    }

    // 필수 필드 검증
    if (!parsed.name) {
      throw new Error('추천 후보자 정보가 누락되었습니다.');
    }

    // 4. 추천 결과 저장
    try {
      const savedRecommendation = await prisma.recommendation.create({
        data: {
          orientationId: Number(orientationId),
          candidateId: parsed.name,
          matchScore: parsed.matchScore,
          matchingPoints: parsed.matchingPoints,
          differences: parsed.differences,
          recommendation: parsed.recommendation,
          detailedAnalysis: parsed.detailedAnalysis
        }
      });
      console.log('Saved recommendation:', savedRecommendation);
    } catch (error) {
      console.error('Error saving recommendation:', error);
      // 추천 저장 실패는 전체 프로세스를 중단하지 않음
    }

    // 5. 응답 전송
    return res.status(200).json({ 
      success: true,
      data: parsed
    });
  } catch (error) {
    console.error('Error in get-recommendation:', error);
    const errorMessage = error instanceof Error ? error.message : '후보자 추천에 실패했습니다.';
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: errorMessage
    });
  }
} 