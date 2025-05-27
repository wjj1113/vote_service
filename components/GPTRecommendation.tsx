import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Card, Container, Row, Col, Form, Alert, Spinner, Toast } from 'react-bootstrap';
import { FaRobot, FaChartLine, FaLock, FaCheck, FaTimes } from 'react-icons/fa';
import { GA_EVENT_DETAILED } from '../lib/gtag';
import styles from './GPTRecommendation.module.css';

interface RecommendationResult {
  name: string;
  party: string;
  matchScore: number;
  slogan?: string;
  imageUrl?: string;
  recommendation: string;
  matchingPoints: string[];
  differences: string[];
  detailedAnalysis?: any;
}

interface SurveyQuestion {
  id: string;
  question: string;
  options: { value: string; label: string }[];
  type?: 'single' | 'multiple';
}

const surveyQuestions: SurveyQuestion[] = [
  {
    id: "tax_welfare",
    question: "복지 확대를 위해 세금 인상은 필요하다",
    options: [
      { value: "1", label: "매우 반대" },
      { value: "2", label: "반대" },
      { value: "3", label: "보통" },
      { value: "4", label: "찬성" },
      { value: "5", label: "매우 찬성" }
    ]
  },
  {
    id: "market_intervention",
    question: "국가는 가능한 한 시장에 개입하지 말아야 한다",
    options: [
      { value: "1", label: "매우 반대" },
      { value: "2", label: "반대" },
      { value: "3", label: "보통" },
      { value: "4", label: "찬성" },
      { value: "5", label: "매우 찬성" }
    ]
  },
  {
    id: "climate_priority",
    question: "기후변화 대응은 경제 성장보다 우선이다",
    options: [
      { value: "1", label: "매우 반대" },
      { value: "2", label: "반대" },
      { value: "3", label: "보통" },
      { value: "4", label: "찬성" },
      { value: "5", label: "매우 찬성" }
    ]
  },
  {
    id: "education_policy",
    question: "교육 정책에서 공교육 강화가 우선되어야 한다",
    options: [
      { value: "1", label: "매우 반대" },
      { value: "2", label: "반대" },
      { value: "3", label: "보통" },
      { value: "4", label: "찬성" },
      { value: "5", label: "매우 찬성" }
    ]
  },
  {
    id: "youth_policy",
    question: "청년 일자리 창출이 가장 시급한 과제다",
    options: [
      { value: "1", label: "매우 반대" },
      { value: "2", label: "반대" },
      { value: "3", label: "보통" },
      { value: "4", label: "찬성" },
      { value: "5", label: "매우 찬성" }
    ]
  },
  {
    id: "regional_development",
    question: "지역 균형 발전이 국가 발전에 중요하다",
    options: [
      { value: "1", label: "매우 반대" },
      { value: "2", label: "반대" },
      { value: "3", label: "보통" },
      { value: "4", label: "찬성" },
      { value: "5", label: "매우 찬성" }
    ]
  },
  {
    id: "security_policy",
    question: "국방력 강화가 국가 안보의 기본이다",
    options: [
      { value: "1", label: "매우 반대" },
      { value: "2", label: "반대" },
      { value: "3", label: "보통" },
      { value: "4", label: "찬성" },
      { value: "5", label: "매우 찬성" }
    ]
  },
  {
    id: "digital_transformation",
    question: "디지털 전환이 국가 경쟁력의 핵심이다",
    options: [
      { value: "1", label: "매우 반대" },
      { value: "2", label: "반대" },
      { value: "3", label: "보통" },
      { value: "4", label: "찬성" },
      { value: "5", label: "매우 찬성" }
    ]
  },
  {
    id: "political_reform",
    question: "정치 개혁이 시급하다",
    options: [
      { value: "1", label: "매우 반대" },
      { value: "2", label: "반대" },
      { value: "3", label: "보통" },
      { value: "4", label: "찬성" },
      { value: "5", label: "매우 찬성" }
    ]
  },
  {
    id: "economic_growth",
    question: "경제 성장이 복지 확대의 전제조건이다",
    options: [
      { value: "1", label: "매우 반대" },
      { value: "2", label: "반대" },
      { value: "3", label: "보통" },
      { value: "4", label: "찬성" },
      { value: "5", label: "매우 찬성" }
    ]
  }
];

const prompt = `당신은 개인화된 정치 성향 요약 전문가입니다.

세계 지금까지 당신과 나눈 대화를 기반으로 분석하여, 제 정치 성향을 관심 주제별로 객관적으로 요약해주세요.

🔍 요약 형식:
1. 정치 성향 (진보/보수/중도 + 정도)
2. 가치 기준 (경제성 / 경제 성장 / 복지 우선도 등)  
3. 주요 관심사 (치안 / 환경 / 경제 / 복지 주제 등)
4. 중요하게 생각하는 정책 분야

💡 요구사항:
- 객관적이고 중립적인 톤으로 작성
- 세계지까지 나눈 대화 내용을 근거로 분석
- 명확하고 구체적인 표현 사용
- 한국어로 응답`;

const privatePrompt = `당신은 개인화된 후보자 추천 전문가입니다.

세계 지금까지 당신과 나눈 대화를 기반으로, 저에게 맞는 \"대한민국 2025 대통령 선거 \"후보자를 추천해주세요.

🎯 분석 요청:
1. 저의 정치 성향과 가치관 분석
2. 가치 기준 (경제 / 복지 / 주요 관심 정책 등)
3. 중요하게 생각하는 정책 영역

🏆 추천 형식:
각 후보자별로:
- 추천 이유 (3-4줄)  
- 일치하는 정책 분야
- 차이점이나 우려사항 (있다면)
- 종합 점수 (100점 만점)

💡 요구사항:
- 객관적이고 균형잡힌 분석
- 구체적인 정책 근거 제시  
- 장단점 모두 언급
- 한국어로 응답`;

interface GPTRecommendationProps {
  onRecommendationComplete: (recommendation: any) => void;
}

const GPTRecommendation: React.FC<GPTRecommendationProps> = ({ onRecommendationComplete }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'premium' | 'quick' | 'private'>('premium');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gptResult, setGptResult] = useState<string>('');
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [surveyAnswers, setSurveyAnswers] = useState<{ [key: string]: string }>({});
  const [surveyProgress, setSurveyProgress] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [userAgreement, setUserAgreement] = useState<null | boolean>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChatGPTClicked, setIsChatGPTClicked] = useState(false);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('프롬프트가 클립보드에 복사되었습니다.');
    GA_EVENT_DETAILED('copy_prompt', { 
      promptType: text.includes('정치 성향') ? 'orientation' : 'recommendation'
    });
  };

  const handleTabChange = (tab: 'premium' | 'quick' | 'private') => {
    setActiveTab(tab);
    setCurrentStep(1);
    setError(null);
    setGptResult('');
    setRecommendation(null);
    setSurveyAnswers({});
    setSurveyProgress(0);
    GA_EVENT_DETAILED(`tab_change_${tab}`);
  };

  const handleSurveyAnswer = (questionId: string, value: string) => {
    setSurveyAnswers(prev => {
      const newAnswers = { ...prev, [questionId]: value };
      const progress = (Object.keys(newAnswers).length / surveyQuestions.length) * 100;
      setSurveyProgress(progress);
      return newAnswers;
    });
    GA_EVENT_DETAILED('survey_answer', { 
      questionId, 
      value,
      progress: Math.round((Object.keys(surveyAnswers).length + 1) / surveyQuestions.length * 100)
    });
  };

  const handleQuickSurveySubmit = async () => {
    if (Object.keys(surveyAnswers).length !== surveyQuestions.length) {
      setError('모든 질문에 답변해 주세요.');
      GA_EVENT_DETAILED('quick_survey_incomplete');
      return;
    }

    setIsLoading(true);
    setError(null);
    GA_EVENT_DETAILED('quick_survey_submit');

    try {
      const response = await fetch('/api/analyze-orientation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          surveyAnswers: surveyAnswers,
          isQuickSurvey: true
        }),
      });

      if (!response.ok) {
        throw new Error('분석 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '설문 분석에 실패했습니다.');
      }

      GA_EVENT_DETAILED('quick_survey_success', {
        orientationId: data.orientationId,
        answersCount: Object.keys(surveyAnswers).length
      });

      router.replace({
        pathname: `/results/${data.orientationId}`,
        query: { result: JSON.stringify(data.result) }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '설문 분석 중 오류가 발생했습니다.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      GA_EVENT_DETAILED('quick_survey_error', { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const extractOrientationData = (text: string) => {
    try {
      // JSON 형식인 경우
      const parsed = JSON.parse(text);
      return {
        orientationId: parsed.orientationId || null,
        politicalOrientation: parsed.politicalOrientation || null,
        values: parsed.values || null,
        interests: parsed.interests || null,
        policyAreas: parsed.policyAreas || null
      };
    } catch (e) {
      // 일반 텍스트인 경우
      const lines = text.split('\n');
      const data: any = {};
      
      lines.forEach(line => {
        if (line.includes('정치 성향')) {
          data.politicalOrientation = line.split(':')[1]?.trim();
        } else if (line.includes('가치 기준')) {
          data.values = line.split(':')[1]?.trim();
        } else if (line.includes('주요 관심사')) {
          data.interests = line.split(':')[1]?.trim();
        } else if (line.includes('정책 분야')) {
          data.policyAreas = line.split(':')[1]?.trim();
        }
      });

      return {
        orientationId: null,
        ...data
      };
    }
  };

  const handleSubmitGPTResult = async () => {
    if (!gptResult || !gptResult.trim()) {
      setError('ChatGPT(다른 AI도 가능) 분석 결과를 입력해 주세요.');
      showNotification('ChatGPT(다른 AI도 가능) 분석 결과를 입력해 주세요.', 'error');
      GA_EVENT_DETAILED('gpt_result_empty');
      return;
    }

    setIsLoading(true);
    setError(null);
    GA_EVENT_DETAILED('gpt_result_submit');

    try {
      // 전체 입력 텍스트를 그대로 API로 전달
      const analysisResponse = await fetch('/api/analyze-orientation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          surveyAnswers: gptResult,
          isPersonalAnalysis: true
        })
      });

      const analysisData = await analysisResponse.json();
      
      if (!analysisResponse.ok || !analysisData.success) {
        throw new Error(analysisData.message || '정치 성향 분석에 실패했습니다.');
      }

      GA_EVENT_DETAILED('gpt_analysis_success', {
        orientationId: analysisData.orientationId,
        resultType: activeTab
      });

      router.replace({
        pathname: `/results/${analysisData.orientationId}`,
        query: { result: JSON.stringify(analysisData.result) }
      });
      showNotification('분석이 완료되었습니다.', 'success');
      GA_EVENT_DETAILED('gpt_recommendation_complete');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      GA_EVENT_DETAILED('gpt_result_error', { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const processSurvey = async (answers: Record<string, string>) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/analyze-orientation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          surveyAnswers: answers,
          isQuickSurvey: true
        }),
      });

      if (!response.ok) {
        throw new Error('분석 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      if (data.success && data.orientationId) {
        // 결과 페이지로 이동
        router.push(`/results/${data.orientationId}`);
      } else {
        throw new Error('분석 결과를 저장하는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Error processing survey:', error);
      setError(error instanceof Error ? error.message : '설문 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgreement = (agrees: boolean) => {
    setUserAgreement(agrees);
    GA_EVENT_DETAILED('recommendation_agreement', { 
      agrees,
      candidate: recommendation?.name,
      matchScore: recommendation?.matchScore,
      party: recommendation?.party
    });
  };

  const handleShare = async (platform: 'twitter' | 'threads' | 'kakaotalk' | 'copy') => {
    if (!recommendation) {
      GA_EVENT_DETAILED('share_error', { error: 'No recommendation available' });
      return;
    }

    const shareText = `추천 후보자: ${recommendation.name}\n추천 사유: ${recommendation.recommendation}`;
    const shareUrl = window.location.href;

    try {
      switch (platform) {
        case 'twitter':
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`);
          break;
        case 'threads':
      window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`);
          break;
        case 'kakaotalk':
      if (window.Kakao && window.Kakao.Share) {
        window.Kakao.Share.sendDefault({
          objectType: 'text',
          text: shareText + '\n' + shareUrl,
          link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
        });
      } else {
        alert('카카오톡 공유가 지원되지 않습니다.');
            GA_EVENT_DETAILED('kakao_share_error', { error: 'Kakao SDK not initialized' });
            return;
      }
          break;
        case 'copy':
      await navigator.clipboard.writeText(shareText + '\n' + shareUrl);
      alert('결과가 클립보드에 복사되었습니다!');
          break;
      }
      GA_EVENT_DETAILED(`share_${platform}`, { 
        candidate: recommendation.name,
        matchScore: recommendation.matchScore,
        party: recommendation.party,
        shareUrl
      });
    } catch (error) {
      console.error('공유 중 오류 발생:', error);
      alert('공유하기에 실패했습니다. 다시 시도해주세요.');
      GA_EVENT_DETAILED(`share_${platform}_error`, { 
        error: error instanceof Error ? error.message : 'Unknown error',
        candidate: recommendation.name
      });
    }
  };

  return (
    <Container className={styles.container}>
      <Toast 
        show={showToast} 
        onClose={() => setShowToast(false)} 
        delay={3000} 
        autohide
        className={styles.toast}
      >
        <Toast.Header>
          <strong className="me-auto">알림</strong>
        </Toast.Header>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>

      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === 'premium' ? styles.active : ''}`}
          onClick={() => handleTabChange('premium')}
        >
          <FaRobot /> 정밀 분석
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'quick' ? styles.active : ''}`}
          onClick={() => handleTabChange('quick')}
        >
          <FaChartLine /> 빠른 설문
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'private' ? styles.active : ''}`}
          onClick={() => handleTabChange('private')}
        >
          <FaLock /> 개인 분석
        </button>
      </div>

      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${(currentStep - 1) * 50}%` }}
          />
        </div>
        <div className={styles.steps}>
          <div className={`${styles.step} ${currentStep >= 1 ? styles.active : ''}`}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepLabel}>선택 및 입력</div>
          </div>
          <div className={`${styles.step} ${currentStep >= 2 ? styles.active : ''}`}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepLabel}>분석 진행</div>
          </div>
          <div className={`${styles.step} ${currentStep >= 3 ? styles.active : ''}`}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepLabel}>결과 확인</div>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className={styles.alert}>
          {error}
        </Alert>
      )}

      {currentStep === 1 && (
        <div className={styles.stepContent}>
          {activeTab === 'premium' && (
            <Card className={styles.card}>
            <Card.Body>
                <h3>🤝 정밀 분석 서비스</h3>
                <p>ChatGPT(다른 AI도 가능)로 상세 분석 후, 우리 데이터와 결합해서 가장 정교하고 개인화된 후보자 추천을 받으세요!</p>
                <div className={styles.promptSection}>
                  <div className={styles.promptHeader}>
                    <h4>🎯 정치 성향 분석 프롬프트</h4>
                    <button 
                      className={styles.copyButton}
                      onClick={() => handleCopyPrompt(prompt)}
                    >
                      📋 복사하기
                    </button>
                  </div>
                  <textarea
                    className={styles.promptContent}
                    value={prompt}
                    readOnly
                  />
                </div>
              <div className={styles.actionButtons}>
                <a 
                  href="https://chat.openai.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                    className={styles.primaryButton}
                >
                    <h3 className="text-center text-xl">🤖 ChatGPT(다른 AI도 가능)에서 분석하기</h3>
                </a>
                <button 
                    className={styles.secondaryButton}
                    onClick={() => setCurrentStep(2)}
                  >
                    다음 단계 →
                  </button>
                </div>
              </Card.Body>
            </Card>
          )}

          {activeTab === 'quick' && (
            <Card className={styles.card}>
              <Card.Body>
                <h3 className="mb-6">⚡ 빠른 설문 서비스</h3>
                <p className="mb-8">10개 질문으로 빠르게 정치 성향을 분석하고 후보자 추천을 받아보세요!</p>
                
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${surveyProgress}%` }}
                  />
                </div>

                <div className={styles.surveyQuestions}>
                  {surveyQuestions.map((question) => (
                    <div key={question.id} className={styles.questionCard}>
                      <h4>{question.question}</h4>
                      <div className={styles.likertScale}>
                        {question.options.map((option) => (
                          <div
                            key={option.value}
                            className={`${styles.likertOption} ${
                              surveyAnswers[question.id] === option.value ? styles.selected : ''
                            }`}
                            onClick={() => handleSurveyAnswer(question.id, option.value)}
                          >
                            <input
                              type="radio"
                              name={question.id}
                              checked={surveyAnswers[question.id] === option.value}
                              onChange={() => {}}
                            />
                            <label>
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.actionButtons}>
                  <button
                    className={styles.primaryButton}
                    onClick={handleQuickSurveySubmit}
                    disabled={Object.keys(surveyAnswers).length !== surveyQuestions.length}
                  >
                    {isLoading ? (
                      <>
                        <Spinner animation="border" size="sm" /> 분석 중...
                      </>
                    ) : (
                      '🎯 결과 분석하기'
                    )}
                  </button>
                </div>
              </Card.Body>
            </Card>
          )}

          {activeTab === 'private' && (
            <Card className={styles.card}>
              <Card.Body>
                <h3>🔒 개인 분석 서비스</h3>
                <p>개인정보 보호를 중시하시나요? ChatGPT(다른 AI도 가능)에서 직접 분석한 후 결과를 가져와 우리 데이터와 결합하세요!</p>
                <div className={styles.promptSection}>
                  <div className={styles.promptHeader}>
                    <h4>🏆 후보자 추천 프롬프트</h4>
                    <button 
                      className={styles.copyButton}
                      onClick={() => handleCopyPrompt(privatePrompt)}
                    >
                      📋 복사하기
                    </button>
                  </div>
                  <textarea
                    className={styles.promptContent}
                    value={privatePrompt}
                    readOnly
                  />
                </div>
                <div className={styles.actionButtons}>
                  <a 
                    href="https://chat.openai.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`${styles.primaryButton} ${styles.centerButton}`}
                  >
                    <h5 className="text-center text-lg">🔒 ChatGPT(다른 AI도 가능)에서 안전하게 분석하기</h5>
                  </a>
                  <button 
                    className={styles.secondaryButton}
                  onClick={() => setCurrentStep(2)}
                >
                  다음 단계 →
                </button>
              </div>
            </Card.Body>
          </Card>
          )}
        </div>
      )}

      {currentStep === 2 && (
        <div className={styles.stepContent}>
          <Card className={styles.card}>
            <Card.Body>
              <h3>📥 ChatGPT(다른 AI도 가능) 분석 결과를 입력해 주세요</h3>
              <div className={styles.infoBox}>
                <h4>💡 입력 방법</h4>
                <p>
                  {activeTab === 'premium' 
                    ? 'ChatGPT(다른 AI도 가능)에서 받은 정치 성향 분석 결과를 아래 텍스트 상자에 그대로 붙여넣어 주세요.'
                    : 'ChatGPT(다른 AI도 가능)에서 받은 후보자 추천 결과를 아래 텍스트 상자에 붙여넣어 주세요.'}
              </p>
              </div>
              <textarea
                className={styles.resultTextarea}
                value={gptResult}
                onChange={(e) => setGptResult(e.target.value)}
                placeholder="ChatGPT(다른 AI도 가능)의 분석 결과를 여기에 붙여넣어 주세요..."
              />
              <div className={styles.actionButtons}>
                <button 
                  className={styles.secondaryButton}
                  onClick={() => setCurrentStep(1)}
                >
                  ← 이전 단계
                </button>
                <button 
                  className={styles.primaryButton}
                  onClick={handleSubmitGPTResult}
                  disabled={!gptResult?.trim() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner animation="border" size="sm" /> 분석 중...
                    </>
                  ) : (
                    '결과 분석하기 →'
                  )}
                </button>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}

      {currentStep === 3 && recommendation && (
        <div className={styles.stepContent}>
          <Card className={styles.card}>
            <Card.Body>
              <h3>🎯 분석 완료</h3>
              <div className={styles.analysisResult}>
                <div className={styles.recommendationCard}>
                  <h4>🤝 추천 후보자</h4>
                  <div className={styles.candidateInfo}>
                    <h5>{recommendation.name}</h5>
                    <p className={styles.party}>{recommendation.party}</p>
                    <p className={styles.matchScore}>
                      매칭 점수: {recommendation.matchScore}%
                    </p>
                    <p className={styles.slogan}>{recommendation.slogan}</p>
                  </div>
                  <div className={styles.reason}>
                    <h5>추천 사유</h5>
                    <p>{recommendation.recommendation}</p>
                  </div>
                  <div className={styles.policies}>
                    <h5>핵심 공약</h5>
                    <ul>
                      {recommendation.matchingPoints && recommendation.matchingPoints.map((policy: string, index: number) => (
                        <li key={index}>{policy}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className={styles.actionButtons}>
                <button 
                  className={styles.secondaryButton}
                  onClick={() => setCurrentStep(2)}
                >
                  ← 이전 단계
                </button>
                <button 
                  className={styles.primaryButton}
                  onClick={() => {
                    setCurrentStep(1);
                    setActiveTab('premium');
                    setGptResult('');
                    setRecommendation(null);
                  }}
                >
                  🔄 다시 시작
                </button>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}

      {recommendation && (
        <div className={styles.resultContainer}>
          <div className={styles.resultHeader}>
            <h2>추천 결과</h2>
          </div>
          <div className={styles.resultContent}>
            <div className={styles.candidateInfo}>
              <div className={styles.imageContainer}>
                <img 
                  src={recommendation.imageUrl} 
                  alt={recommendation.name} 
                  className={styles.candidateImage}
                />
              </div>
              <div className={styles.info}>
                <h3>{recommendation.name}</h3>
                <p>{recommendation.party}</p>
                <p>매칭 점수: {recommendation.matchScore}%</p>
              </div>
            </div>
            <div className={styles.recommendationText}>
              <h4>추천 이유</h4>
              <p>{recommendation.recommendation}</p>
            </div>
            <div className={styles.policies}>
              <h4>핵심 공약</h4>
              <ul>
                {recommendation.matchingPoints && recommendation.matchingPoints.map((policy: string, index: number) => (
                  <li key={index}>{policy}</li>
                ))}
              </ul>
            </div>
            <div className={styles.agreementContainer}>
              {userAgreement === null && (
                <div className={styles.agreementButtons}>
                  <button
                    className={styles.agreeButton}
                    onClick={() => handleAgreement(true)}
                  >
                    네, 일치해요
                  </button>
                  <button
                    className={styles.agreeButton}
                    onClick={() => handleAgreement(false)}
                  >
                    아니요, 일치하지 않아요
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className={styles.actionButtons}>
            <button 
              className={styles.primaryButton}
              onClick={() => handleShare('copy')}
            >
              결과 복사하기
            </button>
            <button 
              className={styles.primaryButton}
              onClick={() => handleShare('twitter')}
            >
              Twitter에 공유하기
            </button>
            <button 
              className={styles.primaryButton}
              onClick={() => handleShare('threads')}
            >
              Threads에 공유하기
            </button>
            <button 
              className={styles.primaryButton}
              onClick={() => handleShare('kakaotalk')}
            >
              카카오톡에 공유하기
            </button>
          </div>
        </div>
      )}
      <div className="mt-8 text-center">
        <h3 className="text-lg font-semibold mb-4">문의</h3>
        <a 
          href="mailto:aipoliticslab@gmail.com" 
          className="text-black hover:text-gray-700 font-medium text-lg transition-colors inline-block"
        >
          aipoliticslab@gmail.com
        </a>
      </div>
    </Container>
  );
};

export default GPTRecommendation; 