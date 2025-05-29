// Vercel redeploy: supabase-js migration
// Vercel redeploy trigger: minor comment
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { prisma } from '../../lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// 후보자 목록
const candidateNames = ["이재명", "김문수", "이준석", "권영국", "황교안", "송진호"];

// 정치 성향 분석을 위한 프롬프트
const analysisPrompt = `당신은 정치 성향 분석 전문가입니다. 주어진 텍스트를 분석하여 다음 5가지 차원에서 점수를 매겨주세요:

1. 진보-보수 (1-10점)
   - 1-3: 강한 진보적 성향 (사회적 평등, 정부의 적극적 역할 강조)
   - 4-6: 중도적 성향 (균형잡힌 접근)
   - 7-10: 강한 보수적 성향 (전통적 가치, 시장 중심 강조)

2. 경제적 자유-통제 (1-10점)
   - 1-3: 강한 시장경제 지지 (최소한의 정부 개입)
   - 4-6: 혼합경제 선호 (시장과 정부의 균형)
   - 7-10: 강한 정부 개입 지지 (경제적 평등 강조)

3. 사회적 자유-통제 (1-10점)
   - 1-3: 강한 개인 자유 지지 (개인의 권리와 선택 강조)
   - 4-6: 중도적 접근 (사회적 규범과 개인 자유의 균형)
   - 7-10: 강한 사회 규제 지지 (전통적 가치와 질서 강조)

4. 환경-산업 (1-10점)
   - 1-3: 강한 환경 보호 지지 (지속가능성 우선)
   - 4-6: 균형잡힌 접근 (환경과 산업의 조화)
   - 7-10: 강한 산업 발전 지지 (경제 성장 우선)

5. 복지-효율 (1-10점)
   - 1-3: 강한 복지 확대 지지 (사회적 안전망 강화)
   - 4-6: 균형잡힌 접근 (복지와 효율성의 조화)
   - 7-10: 강한 효율성 지지 (재정 건전성 우선)

분석 시 다음 사항을 고려해주세요:
1. 텍스트에서 직접적으로 언급된 내용
2. 암시적으로 드러나는 가치관과 선호도
3. 사용된 단어와 문맥의 뉘앙스
4. 전체적인 논조와 톤

다음 JSON 형식으로 응답해주세요:
{
  "scores": {
    "progressive_conservative": 5,
    "economic_freedom": 5,
    "social_freedom": 5,
    "environment_industry": 5,
    "welfare_efficiency": 5
  },
  "confidence": 0.8,
  "keyPoints": ["주요 포인트 1", "주요 포인트 2"],
  "analysis": "전체적인 분석 내용",
  "reasoning": {
    "progressive_conservative": "진보-보수 점수 산정 이유",
    "economic_freedom": "경제적 자유-통제 점수 산정 이유",
    "social_freedom": "사회적 자유-통제 점수 산정 이유",
    "environment_industry": "환경-산업 점수 산정 이유",
    "welfare_efficiency": "복지-효율 점수 산정 이유"
  }
}`;

// 후보자 매칭을 위한 프롬프트
const matchingPrompt = (userScores: any, candidates: any[]) => `당신은 정치 성향 매칭 전문가입니다.

사용자의 정치 성향 점수:
${JSON.stringify(userScores, null, 2)}

후보자들의 정치 성향 데이터:
${JSON.stringify(candidates, null, 2)}

각 후보자와의 매칭 점수를 계산하고, 가장 적합한 후보자를 추천해주세요.
매칭 점수는 다음 기준으로 계산해주세요:

1. 정책 일치도 (40%)
   - 사용자의 주요 관심사와 후보자의 정책이 얼마나 일치하는지
   - 정책의 구체성과 실행 가능성

2. 가치관 일치도 (30%)
   - 사용자의 정치 성향 점수와 후보자의 정치 성향이 얼마나 유사한지
   - 핵심 가치와 원칙의 일치도

3. 지역/계층 특성 (20%)
   - 사용자의 지역적 특성과 후보자의 지역 기반
   - 연령대, 성별 등 인구통계학적 특성

4. 리더십 스타일 (10%)
   - 후보자의 리더십 스타일과 사용자의 선호도
   - 의사소통 방식과 정책 추진력

다음 JSON 형식으로 응답해주세요:
{
  "recommendations": [
    {
      "candidateId": "후보자ID",
      "matchScore": 85,
      "matchingPoints": ["매칭 포인트 1", "매칭 포인트 2"],
      "differences": ["차이점 1", "차이점 2"],
      "recommendation": "추천 이유",
      "detailedAnalysis": {
        "policyMatch": {
          "score": 90,
          "reason": "정책 일치도 분석"
        },
        "valueMatch": {
          "score": 85,
          "reason": "가치관 일치도 분석"
        },
        "demographicMatch": {
          "score": 80,
          "reason": "지역/계층 특성 분석"
        },
        "leadershipMatch": {
          "score": 75,
          "reason": "리더십 스타일 분석"
        }
      }
    }
  ],
  "analysis": "전체적인 분석 내용"
}`;

// 정밀 분석 프롬프트
const detailedAnalysisPrompt = {
  role: "당신은 정치 성향 분석 전문가입니다.",
  task: `주어진 텍스트를 분석하여 다음 5가지 차원에서 점수를 매겨주세요:\n1. 진보-보수 (1-10점)\n2. 경제적 자유-통제 (1-10점)\n3. 사회적 자유-통제 (1-10점)\n4. 환경-산업 (1-10점)\n5. 복지-효율 (1-10점)`,
  output: `{
    "politicalOrientation": {
      "tendency": "진보/중도/보수",
      "valueBase": "주요 가치관",
      "interests": ["관심 분야1", "관심 분야2"],
      "voteBase": "투표 기준"
    },
    "scores": {
      "progressiveConservative": 1-10,
      "economicFreedomControl": 1-10,
      "socialFreedomControl": 1-10,
      "environmentIndustry": 1-10,
      "welfareEfficiency": 1-10
    },
    "confidence": 0.0-1.0,
    "reasoning": {
      "progressiveConservative": "점수 부여 이유",
      "economicFreedomControl": "점수 부여 이유",
      "socialFreedomControl": "점수 부여 이유",
      "environmentIndustry": "점수 부여 이유",
      "welfareEfficiency": "점수 부여 이유"
    }
  }`
};

// 개인 분석 프롬프트
const personalAnalysisPrompt = {
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

// 빠른 설문 프롬프트
const quickSurveyPrompt = {
  role: "당신은 정치 성향 분석 전문가입니다.",
  task: `주어진 설문 응답을 분석하여 정치 성향을 파악하고, 다음 정보를 추출해주세요:
  1. 정치 성향 (진보/중도/보수)
  2. 주요 가치관
  3. 관심 정책 분야
  4. 투표 기준`,
  output: `{
    "politicalOrientation": {
      "tendency": "진보/중도/보수",
      "valueBase": "주요 가치관",
      "interests": ["관심 분야1", "관심 분야2"],
      "voteBase": "투표 기준"
    },
    "scores": {
      "progressiveConservative": 1-10,
      "economicFreedomControl": 1-10,
      "socialFreedomControl": 1-10,
      "environmentIndustry": 1-10,
      "welfareEfficiency": 1-10
    },
    "confidence": 0.0-1.0,
    "reasoning": {
      "progressiveConservative": "점수 부여 이유",
      "economicFreedomControl": "점수 부여 이유",
      "socialFreedomControl": "점수 부여 이유",
      "environmentIndustry": "점수 부여 이유",
      "welfareEfficiency": "점수 부여 이유"
    }
  }`
};

// 데이터 가공 프롬프트
const dataProcessingPrompt = {
  role: "당신은 정치 성향 분석을 위한 데이터 가공 전문가입니다. 어떤 형태의 입력이 들어와도 반드시 구조화된 데이터를 생성해야 합니다.",
  task: `주어진 텍스트를 분석하여 정치 성향 분석에 필요한 정보를 추출하고 구조화해주세요. 입력된 텍스트가 불충분하거나 모호한 경우에도, 텍스트에서 암시되는 정보를 최대한 활용하여 추론해주세요. 텍스트에 직접적인 정보가 없는 경우에는 중립적인 값을 사용하되, 그 이유를 reasoning에 명시해주세요.`,
  output: `{
    "processedData": {
      "tendency": "진보/중도/보수",
      "valueBase": "주요 가치관과 원칙",
      "interests": ["관심 분야1", "관심 분야2"],
      "voteBase": "투표 결정 기준",
      "preferences": {
        "progressiveConservative": 1-10,
        "economicFreedomControl": 1-10,
        "socialFreedomControl": 1-10,
        "environmentIndustry": 1-10,
        "welfareEfficiency": 1-10
      }
    },
    "confidence": 0.0-1.0,
    "reasoning": "데이터 가공 과정에 대한 설명 (특히 기본값을 사용한 경우 그 이유를 명시)"
  }`
};

// 후보자 추천 프롬프트
const candidateRecommendationPrompt = {
  role: "당신은 정치 성향 분석 및 후보자 추천 전문가입니다. 2025년의 최신 데이터를 기반으로만 도출해주세요 정당이나 유명도는 판단 기준이 아닙니다. 단순히 '진보=이재명 / 보수=황교안' 식의 이분법은 피하고, 반드시 각 항목별 적합도를 세부 분석해 판단하세요. 사용자의 성향 분석의 이유를 기반으로, 사용자의 성향 수치 및 가치관을 기반으로 각 후보자와의 적합도를 비교해, 가장 일치하는 후보자를 추천해야 합니다.",
  task: `아래 정치 성향 분석 결과를 기반으로, 반드시 다음 후보자명 중에서 가장 적합한 후보자 한 명을 추천하세요.
후보자명 리스트: ${candidateNames.map((n: string) => `"${n}"`).join(", ")}


2025년의 최신 데이터를 기반으로만 도출해주세요
정당이나 유명도는 판단 기준이 아닙니다. 단순히 '진보=이재명 / 보수=황교안' 식의 이분법은 피하고, 반드시 각 항목별 적합도를 세부 분석해 판단하세요.
사용자의 성향 분석의 이유를 기반으로, 사용자의 성향 수치 및 가치관을 기반으로 각 후보자와의 적합도를 비교해, 가장 일치하는 후보자를 추천해야 합니다.              


📊 참고할 정치 성향 데이터는 다음 항목을 포함합니다:
- 일반 성향: 중도/보수/진보 중 어디에 가까운지
- 가치 기반: 전통, 안보, 경제성장, 복지, 환경 등 중시 항목
- 선호도 수치: (0~10)
  - progressiveConservative
  - economicFreedomControl
  - socialFreedomControl
  - environmentIndustry
  - welfareEfficiency

🎯 반드시 다음 기준을 모두 반영하세요:
- 후보의 공약과 사용자의 성향 점수 간 **정량적 일치도** 평가
- 후보의 가치관 및 리더십 스타일과 사용자의 가치관 간 **정성적 유사성**
- 정당이나 유명도는 판단 기준이 아님
- '이재명=진보, 황교안=보수' 식의 단순 대응을 피하고, **정책 항목별 세부 적합도**를 기반으로 추천

❗반드시 위 후보자명 중에서만 name 값을 선택하세요.
❗다음 output 구조에 맞춰 모든 필드를 빠짐없이 채워서 반환하세요. 추가 JSON이나 설명은 포함하지 마세요.`,
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

// 정책 카테고리 정의
const policyCategories = [
  'tax_welfare',
  'market_intervention',
  'climate_priority',
  'education_policy',
  'youth_policy',
  'regional_development',
  'security_policy',
  'digital_transformation',
  'political_reform',
  'economic_growth'
];

// 정책 카테고리 한글-영문 매핑
const categoryMap: { [key: string]: string } = {
  '복지': 'tax_welfare',
  '경제': 'economic_growth',
  '환경': 'climate_priority',
  '정치': 'political_reform',
  '청년': 'youth_policy',
  '노동': 'market_intervention',
  '안보': 'security_policy',
  '교육': 'education_policy',
  '디지털': 'digital_transformation',
  '지역': 'regional_development',
};

// 한글 카테고리 매핑
const categoryKoreanMap: { [key: string]: string } = {
  tax_welfare: '복지',
  market_intervention: '노동/시장',
  climate_priority: '환경',
  education_policy: '교육',
  youth_policy: '청년',
  regional_development: '지역',
  security_policy: '안보',
  digital_transformation: '디지털',
  political_reform: '정치개혁',
  economic_growth: '경제'
};

// 코사인 유사도 계산 함수
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// 후보자 정보 보강 함수
async function fillCandidateInfo(recommendation: any) {
  if (!recommendation?.name) return recommendation;
  
  const candidate = await prisma.candidate.findFirst({
    where: { name: recommendation.name },
    include: { 
      policies: {
        orderBy: { order: 'asc' },
        take: 3 // 상위 3개의 정책만 가져오기
      }
    }
  });

  if (!candidate) return recommendation;

  // 이미지 URL이 없는 경우 기본 이미지 사용
  const imageUrl = candidate.imageUrl || '/images/default-candidate.png';
  
  // 정책 정보 가져오기
  const matchingPoints = candidate.policies.map((p: any) => ({
    title: p.title,
    description: p.summary,
    details: {
      goal: p.goal,
      implementation: p.implementation,
      duration: p.duration,
      budget: p.budget
    }
  }));

  return {
    ...recommendation,
    party: candidate.party,
    imageUrl,
    matchingPoints,
    differences: recommendation.differences || [],
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { surveyAnswers, isQuickSurvey, isPersonalAnalysis } = req.body;
    console.log('=== API 입력 데이터 ===');
    console.log('설문 응답:', JSON.stringify(surveyAnswers, null, 2));
    console.log('빠른 설문 여부:', isQuickSurvey);
    console.log('개인 분석 여부:', isPersonalAnalysis);

    if (!surveyAnswers) {
      return res.status(400).json({ 
        success: false, 
        error: '필수 정보 누락',
        message: '설문 응답이 누락되었습니다. 모든 질문에 답변해주세요.'
      });
    }

    let analysisResult;
    // 1. 정치 성향 분석 (정밀/설문/개인 모두)
    if (isQuickSurvey) {
      // 1. DB에서 후보자 정보와 정책 가져오기
      const candidates = await prisma.candidate.findMany({
        include: {
          policies: {
            select: {
              id: true,
              title: true,
              order: true,
              categories: true,
              candidateId: true
            }
          }
        }
      });

      console.log('DB에서 가져온 후보자 데이터:', JSON.stringify(candidates, null, 2));

      // 2. 사용자 응답 벡터 변환 (1-5 스케일로 정규화)
      const userVector: number[] = [
        surveyAnswers.tax_welfare ? (Number(surveyAnswers.tax_welfare) - 1) / 4 : 0.5,
        surveyAnswers.market_intervention ? (Number(surveyAnswers.market_intervention) - 1) / 4 : 0.5,
        surveyAnswers.climate_priority ? (Number(surveyAnswers.climate_priority) - 1) / 4 : 0.5,
        surveyAnswers.education_policy ? (Number(surveyAnswers.education_policy) - 1) / 4 : 0.5,
        surveyAnswers.youth_policy ? (Number(surveyAnswers.youth_policy) - 1) / 4 : 0.5,
        surveyAnswers.regional_development ? (Number(surveyAnswers.regional_development) - 1) / 4 : 0.5,
        surveyAnswers.security_policy ? (Number(surveyAnswers.security_policy) - 1) / 4 : 0.5,
        surveyAnswers.digital_transformation ? (Number(surveyAnswers.digital_transformation) - 1) / 4 : 0.5,
        surveyAnswers.political_reform ? (Number(surveyAnswers.political_reform) - 1) / 4 : 0.5,
        surveyAnswers.economic_growth ? (Number(surveyAnswers.economic_growth) - 1) / 4 : 0.5
      ];

      console.log('User vector:', userVector);

      // 벡터가 모두 0인 경우 기본값 설정
      if (userVector.every(v => v === 0.5)) {
        console.log('Warning: All user vector values are 0.5, using default values');
        for (let i = 0; i < userVector.length; i++) {
          userVector[i] = 0.5; // 중립적인 값으로 설정
        }
      }

      // 3. 각 후보자와의 유사도 계산
      const matchScores = candidates.map((candidate: any) => {
        // 후보자의 정책 벡터 계산
        const policyVector = Array(10).fill(0);
        let totalCategories = 0;
        
        candidate.policies.forEach((policy: any) => {
          const categories = policy.categories as string[];
          categories.forEach(category => {
            const mapped = categoryMap[category] || category;
            const index = policyCategories.indexOf(mapped);
            if (index >= 0) {
              policyVector[index] += 1;
              totalCategories += 1;
            }
          });
        });

        // 정규화 (총 카테고리 수로 나누어 비율 계산)
        if (totalCategories > 0) {
          for (let i = 0; i < policyVector.length; i++) {
            policyVector[i] = policyVector[i] / totalCategories;
          }
        }

        // 가중치 적용 (경제, 복지, 환경, 사회 등 중요도에 따른 가중치)
        const weights = [1.2, 1.0, 1.1, 0.9, 1.0, 1.0, 1.1, 0.9, 1.0, 0.8];
        const weightedUserVector = userVector.map((v, i) => v * weights[i]);
        const weightedPolicyVector = policyVector.map((v, i) => v * weights[i]);

        // 코사인 유사도 계산
        const score = cosineSimilarity(weightedUserVector, weightedPolicyVector);

        // 정책 일치도 계산 (60% 이상 일치하는 정책)
        const matchingPoints = candidate.policies
          .filter((p: any) => {
            const categories = p.categories as string[];
            return categories.some(category => {
              const index = policyCategories.indexOf(category);
              return index >= 0 && Math.abs(userVector[index] - policyVector[index]) < 0.4;
            });
          })
          .map((p: any) => typeof p === 'string' ? p : (p.title || ''))
          .filter((v: string) => !!v);

        // 디버깅 로그 추가
        console.log('후보:', candidate.name);
        console.log('정책 벡터:', policyVector);
        console.log('userVector:', userVector);
        console.log('가중치 적용 userVector:', weightedUserVector);
        console.log('가중치 적용 정책 벡터:', weightedPolicyVector);
        console.log('코사인 유사도 score:', score);
        console.log('매칭 포인트:', matchingPoints);

        return { 
          candidate, 
          score,
          matchingPoints,
          differences: candidate.policies
            .filter((p: any) => !matchingPoints.includes(typeof p === 'string' ? p : (p.title || '')))
            .map((p: any) => typeof p === 'string' ? p : (p.title || ''))
        };
      });

      // 4. 가장 높은 점수의 후보자 선택
      const best = matchScores.reduce((prev: any, current: any) => 
        current.score > prev.score ? current : prev
      );
      const matchScore = Math.round(best.score * 100);

      // 정치 성향 요약 가공
      const topCategories = policyCategories
        .map((cat, idx) => ({ cat, value: userVector[idx] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 2)
        .map(({ cat }) => categoryKoreanMap[cat]);
      const tendency = userVector[0] > 0.5 ? '진보적' : '보수적';
      const reasoning = `당신은 ${topCategories.join(', ')} 분야에 높은 관심을 보였습니다.`;
      const voteBase = '정책 매칭 기반';
      const valueBase = topCategories.join(', ');

      // 5. 정치 성향 저장
      const savedOrientation = await prisma.politicalOrientation.create({
        data: {
          rawInput: JSON.stringify(surveyAnswers),
          tendency,
          valueBase,
          interests: topCategories,
          voteBase,
          scores: Object.fromEntries(policyCategories.map((cat: string, idx: number) => [cat, userVector[idx]])),
          confidence: 1,
          reasoning
        }
      });

      // 6. 추천 결과 생성 (DB 저장용)
      // 후보자 id 검증 및 매핑
      console.log('=== 후보자 매핑 시작 ===');
      console.log('best.candidate:', best.candidate);

      let candidateId = best.candidate.id;
      let candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
      console.log('findUnique by id:', candidate);
      console.log('candidateId 값:', candidateId, '타입:', typeof candidateId, '길이:', candidateId?.length);

      if (!candidate) {
        // 이름 정규화(공백, 대소문자, 특수문자 제거)
        const cleanedName = String(best.candidate.name).replace(/[^\w가-힣]/g, '').toLowerCase();
        const allCandidates = await prisma.candidate.findMany();
        const allCandidatesTyped: any[] = allCandidates;
        candidate = allCandidatesTyped.find((c: any) => c.name.replace(/[^\w가-힣]/g, '').toLowerCase() === cleanedName);
        if (candidate) {
          candidateId = candidate.id;
        } else {
          console.error('존재하지 않는 후보자 id:', candidateId, '이름:', best.candidate.name);
          // Recommendation 저장하지 않고 에러 리턴
          return res.status(400).json({
            success: false,
            error: '추천 후보자를 찾을 수 없습니다.',
            message: `DB에 존재하지 않는 후보자: ${best.candidate.name}`
          });
        }
      }

      // 최종적으로 DB에 존재하는지 한 번 더 검증
      const candidateCheck = await prisma.candidate.findUnique({ where: { id: candidateId } });
      console.log('최종 candidateCheck:', candidateCheck);
      if (!candidateId || !candidateCheck) {
        console.error('최종적으로 DB에 존재하지 않는 candidateId:', candidateId);
        analysisResult = {
          politicalOrientation: {
            tendency,
            valueBase,
            interests: topCategories,
            voteBase
          },
          scores: Object.fromEntries(policyCategories.map((cat: string, idx: number) => [cat, userVector[idx]])),
          confidence: 1,
          reasoning,
          recommendations: []
        };
        return;
      }

      // Recommendation 생성 전, 해당 orientationId로 이미 Recommendation이 있는지 확인
      let recommendation = await prisma.recommendation.findUnique({ where: { orientationId: savedOrientation.id } });
      const recommendationData = {
        orientationId: savedOrientation.id,
        candidateId: candidateId,
        matchScore: matchScore,
        matchingPoints: best.matchingPoints.map((p: any) => typeof p === 'string' ? p : p.title), // title만 추출
        differences: best.differences,
        recommendation: `${best.candidate.name} 후보는 사용자의 응답과 ${topCategories.join(', ')} 분야 정책/가치관이 가장 유사합니다.`,
        detailedAnalysis: {
          policyMatch: { score: matchScore, reason: '정책 일치도 분석' },
          valueMatch: { score: matchScore, reason: '가치관 일치도 분석' },
          demographicMatch: { score: matchScore, reason: '지역/계층 특성 분석' },
          leadershipMatch: { score: matchScore, reason: '리더십 스타일 분석' }
        }
      };
      if (recommendation) {
        recommendation = await prisma.recommendation.update({
          where: { orientationId: savedOrientation.id },
          data: recommendationData
        });
      } else {
        recommendation = await prisma.recommendation.create({ data: recommendationData });
      }

      // === 결과 구조를 results/[id].tsx에서 사용하는 구조로 변환 ===
      analysisResult = {
        politicalOrientation: {
          tendency,
          valueBase,
          interests: topCategories,
          voteBase
        },
        scores: Object.fromEntries(policyCategories.map((cat: string, idx: number) => [cat, userVector[idx]])),
        confidence: 1,
        reasoning,
        recommendations: [
          {
            name: best.candidate.name,
            party: best.candidate.party,
            imageUrl: best.candidate.imageUrl || '',
            matchScore: matchScore,
            slogan: '', // 빠른 설문에는 슬로건 없음
            recommendation: recommendationData.recommendation,
            matchingPoints: best.matchingPoints,
            differences: best.differences,
            detailedAnalysis: recommendationData.detailedAnalysis,
            policies: (best.candidate.policies || []).slice(0, 3).map((p: any) => ({
              title: p.title,
              summary: '',
              goal: '',
              implementation: '',
              duration: '',
              budget: ''
            }))
          }
        ]
      };
      // === 변환 끝 ===
      // DB 저장 없이 결과만 반환
      return res.status(200).json({
        success: true,
        result: analysisResult
      });
    } else if (isPersonalAnalysis) {
      // 1. 데이터 가공
      console.log('=== 1단계: 데이터 가공 시작 ===');
      console.log('입력 데이터:', surveyAnswers);
      const processedDataResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: dataProcessingPrompt.role },
          { role: "user", content: `아래 텍스트를 분석하여 JSON 형식으로 응답해주세요.\n\n${dataProcessingPrompt.task}\n\n${dataProcessingPrompt.output}\n\n입력 텍스트:\n${surveyAnswers}` }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });
      console.log('OpenAI 응답:', processedDataResponse.choices[0].message.content);
      const processedData = JSON.parse(processedDataResponse.choices[0].message.content ?? '{}');

      // 2. 정치 성향 저장
      const savedOrientation = await prisma.politicalOrientation.create({
        data: {
          rawInput: JSON.stringify(surveyAnswers),
          tendency: processedData.processedData.tendency,
          valueBase: processedData.processedData.valueBase,
          interests: processedData.processedData.interests,
          voteBase: processedData.processedData.voteBase,
          scores: processedData.processedData.preferences,
          confidence: processedData.confidence,
          reasoning: processedData.reasoning
        }
      });

      // 3. 후보자 추천
      console.log('=== 2단계: 후보자 추천 프롬프트 ===');
      console.log('사용자 프롬프트:', `${candidateRecommendationPrompt.role}\n\n${candidateRecommendationPrompt.task}\n\n성향 분석의 이유는 아래와 같습니다:\n\njson\n${JSON.stringify(processedData.reasoning, null, 2)}\n\`\`\`\n\n성향 분석 결과는 아래와 같습니다:\n\`\`\`json\n${JSON.stringify(processedData.processedData, null, 2)}\n\`\`\`\n\n다음 output 구조에 맞춰 JSON만 반환하세요:\n${candidateRecommendationPrompt.output}`);

      const recommendationResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `
              당신은 정치 성향 분석 및 후보자 추천 전문가입니다. 
              2025년의 최신 데이터를 기반으로만 도출해주세요
              정당이나 유명도는 판단 기준이 아닙니다. 단순히 '진보=이재명 / 보수=황교안' 식의 이분법은 피하고, 반드시 각 항목별 적합도를 세부 분석해 판단하세요.
              사용자의 성향 분석의 이유를 기반으로, 사용자의 성향 수치 및 가치관을 기반으로 각 후보자와의 적합도를 비교해, 가장 일치하는 후보자를 추천해야 합니다.
              `
          },
          {
            role: "user",
            content:
              `${candidateRecommendationPrompt.task}\n\n` +
              `성향 분석의 이유는 아래와 같습니다:\n` +
              `\`\`\`json\n${JSON.stringify(processedData.reasoning, null, 2)}\n\`\`\`\n\n` +
              `성향 분석 결과는 아래와 같습니다:\n` +
              `\`\`\`json\n${JSON.stringify(processedData.processedData, null, 2)}\n\`\`\`\n\n` +
              `다음 output 구조에 맞춰 JSON만 반환하세요:\n` +
              `${candidateRecommendationPrompt.output}`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      console.log('=== API 응답 ===');
      console.log(JSON.stringify(recommendationResponse, null, 2));

      const recommendation = JSON.parse(recommendationResponse.choices[0].message.content ?? '{}');

      // 4. 추천 결과 저장
      let candidateId = recommendation.name || '';
      if (candidateId) {
        // 공백 제거 후 매칭
        const allCandidates = await prisma.candidate.findMany();
        const cleanedName = String(candidateId).replace(/\s+/g, '');
        const candidate = allCandidates.find((c: any) => c.name.replace(/\s+/g, '') === cleanedName);
        if (candidate) {
          candidateId = candidate.id;
        } else {
          console.error('추천 후보자의 uuid를 찾을 수 없습니다:', candidateId);
          candidateId = undefined; // candidateId를 undefined로 설정하여 외래 키 제약 조건 위반 방지
        }
      }

      analysisResult = {
        politicalOrientation: processedData.processedData,
        scores: processedData.processedData.preferences,
        confidence: processedData.confidence,
        reasoning: processedData.reasoning,
        recommendation: await fillCandidateInfo(recommendation)
      };
    } else {
      // 정밀 분석: 1단계 데이터 가공 → 2단계 정치 성향 분석
      console.log('=== 1단계: 데이터 가공 시작 ===');
      console.log('입력 데이터:', surveyAnswers);
      const processedDataResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: dataProcessingPrompt.role },
          { role: "user", content: `아래 텍스트를 분석하여 JSON 형식으로 응답해주세요.\n\n${dataProcessingPrompt.task}\n\n${dataProcessingPrompt.output}\n\n입력 텍스트:\n${surveyAnswers}\n\n분석 과정에서 사용한 추론(reasoning)을 content에 포함시켜주세요.` }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });
      console.log('OpenAI 응답:', processedDataResponse.choices[0].message.content);
      const processedData = JSON.parse(processedDataResponse.choices[0].message.content ?? '{}');

      // 2. 정치 성향 저장
      const savedOrientation = await prisma.politicalOrientation.create({
        data: {
          rawInput: JSON.stringify(surveyAnswers),
          tendency: processedData.processedData.tendency,
          valueBase: processedData.processedData.valueBase,
          interests: processedData.processedData.interests,
          voteBase: processedData.processedData.voteBase,
          scores: processedData.processedData.preferences,
          confidence: processedData.confidence,
          reasoning: processedData.reasoning
        }
      });

      // 3. 후보자 추천

      const recommendationResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `
              당신은 정치 성향 분석 및 후보자 추천 전문가입니다. 
              2025년의 최신 데이터를 기반으로만 도출해주세요
              정당이나 유명도는 판단 기준이 아닙니다. 단순히 '진보=이재명 / 보수=황교안' 식의 이분법은 피하고, 반드시 각 항목별 적합도를 세부 분석해 판단하세요.
              사용자의 성향 분석의 이유를 기반으로, 사용자의 성향 수치 및 가치관을 기반으로 각 후보자와의 적합도를 비교해, 가장 일치하는 후보자를 추천해야 합니다.
              `
          },
          {
            role: "user",
            content:
              `${candidateRecommendationPrompt.task}\n\n` +
              `성향 분석의 이유는 아래와 같습니다:\n` +
              `\`\`\`json\n${JSON.stringify(processedData.reasoning, null, 2)}\n\`\`\`\n\n` +
              `성향 분석 결과는 아래와 같습니다:\n` +
              `\`\`\`json\n${JSON.stringify(processedData.processedData, null, 2)}\n\`\`\`\n\n` +
              `다음 output 구조에 맞춰 JSON만 반환하세요:\n` +
              `${candidateRecommendationPrompt.output}`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });
      

      console.log('=== API 응답 ===');
      console.log(JSON.stringify(recommendationResponse, null, 2));

      const recommendation = JSON.parse(recommendationResponse.choices[0].message.content ?? '{}');

      // 4. 추천 결과 저장
      let candidateId = recommendation.name || '';
      if (candidateId) {
        // 공백 제거 후 매칭
        const allCandidates = await prisma.candidate.findMany();
        const cleanedName = String(candidateId).replace(/\s+/g, '');
        const candidate = allCandidates.find((c: any) => c.name.replace(/\s+/g, '') === cleanedName);
        if (candidate) {
          candidateId = candidate.id;
        } else {
          console.error('추천 후보자의 uuid를 찾을 수 없습니다:', candidateId);
          candidateId = undefined; // candidateId를 undefined로 설정하여 외래 키 제약 조건 위반 방지
        }
      }

      analysisResult = {
        politicalOrientation: processedData.processedData,
        scores: processedData.processedData.preferences,
        confidence: processedData.confidence,
        reasoning: processedData.reasoning,
        recommendation: await fillCandidateInfo(recommendation)
      };
    }

    // 2. DB 저장 (정치 성향)
    const savedOrientation = await prisma.politicalOrientation.create({
      data: {
        rawInput: JSON.stringify(surveyAnswers),
        tendency: analysisResult?.politicalOrientation?.tendency || '분석 중',
        valueBase: analysisResult?.politicalOrientation?.valueBase || '분석 중',
        interests: analysisResult?.politicalOrientation?.interests || ['분석 중'],
        voteBase: analysisResult?.politicalOrientation?.voteBase || '분석 중',
        scores: analysisResult?.scores || {},
        confidence: analysisResult?.confidence || 0,
        reasoning: analysisResult?.reasoning || ''
      }
    });

    // 3. 후보자 추천 결과 저장
    let candidateId = analysisResult?.recommendation?.name || '';
    if (candidateId) {
      // 공백 제거 후 매칭
      const allCandidates = await prisma.candidate.findMany();
      const cleanedName = String(candidateId).replace(/\s+/g, '');
      const candidate = allCandidates.find((c: any) => c.name.replace(/\s+/g, '') === cleanedName);
      if (candidate) {
        candidateId = candidate.id;
      } else {
        throw new Error('추천 후보자의 uuid를 찾을 수 없습니다.');
      }
    }
    const savedRecommendation = await prisma.recommendation.create({
      data: {
        orientationId: savedOrientation.id,
        candidateId: candidateId && candidateId !== '' ? candidateId : undefined,
        matchScore: analysisResult?.recommendation?.matchScore || 0,
        matchingPoints: analysisResult?.recommendation?.matchingPoints || [],
        differences: analysisResult?.recommendation?.differences || [],
        recommendation: analysisResult?.recommendation?.recommendation || '',
        detailedAnalysis: analysisResult?.recommendation?.detailedAnalysis || {}
      }
    });

    // 4. 대시보드 통계 업데이트
    try {
      if (analysisResult?.politicalOrientation && analysisResult?.recommendation) {
      await prisma.surveyStats.upsert({
        where: { id: 1 },
        update: {
          totalResponses: { increment: 1 },
          lastUpdated: new Date(),
          voteIntentCounts: {
            update: {
                [analysisResult.politicalOrientation.voteBase || '분석 중']: { increment: 1 }
            }
          },
          partySupportCounts: {
            update: {
                [analysisResult.recommendation.party || '알 수 없음']: { increment: 1 }
            }
          },
          keyIssuesCounts: {
            update: {
                ...(analysisResult.politicalOrientation.interests || ['분석 중']).reduce((acc: any, interest: string) => ({
                ...acc,
                [interest]: { increment: 1 }
              }), {})
            }
          }
        },
        create: {
          id: 1,
          totalResponses: 1,
          lastUpdated: new Date(),
          voteIntentCounts: {
              [analysisResult.politicalOrientation.voteBase || '분석 중']: 1
          },
          partySupportCounts: {
              [analysisResult.recommendation.party || '알 수 없음']: 1
          },
          keyIssuesCounts: {
              ...(analysisResult.politicalOrientation.interests || ['분석 중']).reduce((acc: any, interest: string) => ({
              ...acc,
              [interest]: 1
            }), {})
          }
        }
      });
      }
    } catch (error) {
      console.error('대시보드 통계 업데이트 실패:', error);
      // 통계 업데이트 실패는 전체 프로세스를 중단하지 않음
    }

    // 5. 결과 반환
    const responseData = {
      success: true,
      result: {
        ...analysisResult,
        candidateImageUrls: {
          "이재명": "https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153692/gicho/thumbnail.100153692.JPG",
          "김문수": "https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153710/gicho/thumbnail.100153710.JPG",
          "이준석": "https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153689/gicho/thumbnail.100153689.JPG",
          "권영국": "https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153725/gicho/thumbnail.100153725.JPG",
          "황교안": "https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153708/gicho/thumbnail.100153708.JPG",
          "송진호": "https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153708/gicho/thumbnail.100153708.JPG"
        }
      },
      orientationId: savedOrientation.id
    };

    console.log('=== API 출력 데이터 ===');
    console.log('분석 결과:', JSON.stringify(analysisResult, null, 2));
    console.log('저장된 정치 성향 ID:', savedOrientation.id);
    console.log('최종 응답 데이터:', JSON.stringify(responseData, null, 2));

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error analyzing orientation:', error);
    const errorMessage = error instanceof Error ? error.message : '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류',
      message: errorMessage
    });
  }
} 