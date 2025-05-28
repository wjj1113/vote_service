import React, { useState } from 'react';
import { message } from 'antd';

const PoliticalSurveyModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    vote_intent: '',
    supported_party: '',
    key_issue: '',
    region: '',
    age_group: '',
    gender: ''
  });
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = () => {
    setIsOpen(true);
    setStep(1);
    setComplete(false);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const nextStep = () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      submitSurvey();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const submitSurvey = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLoading(true);
    try {
      const response = await fetch('/api/submit-survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error('설문 제출에 실패했습니다.');
      }
      setComplete(true);
      message.success('설문이 성공적으로 제출되었습니다.');
    } catch (error) {
      console.error('설문 제출 중 오류 발생:', error);
      message.error('설문 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const goToHome = () => {
    closeModal();
  };

  const goToCandidateRecommendation = () => {
    closeModal();
    if (typeof window !== 'undefined') {
      window.location.hash = '#ai';
    }
  };

  const progress = (step / 6) * 100;

  return (
    <>
      {/* 하단 고정 강조 버튼 */}
      <button 
        onClick={openModal}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-8 py-4 text-xl font-bold rounded-full shadow-lg transition-colors bg-black text-white hover:bg-gray-800"
      >
        투표 의향이 있으신가요?
      </button>

      {/* 모달 오버레이 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-white text-xl font-bold">당신의 정치 감각을 확인해보세요!</h2>
                <button 
                  onClick={closeModal}
                  className="text-white opacity-70 hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-blue-100 mt-2">간단한 설문으로 당신의 정치 성향과 투표 의향을 분석해드립니다.</p>
            </div>
            {/* 진행 상황 표시 */}
            <div className="px-6 py-2 border-b">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>질문 {step} / 6</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-black h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            {/* 모달 컨텐츠 */}
            <div className="p-6">
              {!complete ? (
                <>
                  {/* 질문 1: 투표 계획 */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">다가오는 대선에서 투표하실 계획이 있으신가요?</h3>
                      <div className="space-y-2">
                        {[
                          { label: '반드시 투표할 것이다', value: 'definitely_vote' },
                          { label: '가능하면 투표할 것이다', value: 'likely_vote' },
                          { label: '아마 투표하지 않을 것이다', value: 'unlikely_vote' },
                          { label: '투표하지 않을 것이다', value: 'definitely_not_vote' }
                        ].map((option) => (
                          <div 
                            key={option.value}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              formData.vote_intent === option.value 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                            onClick={() => handleChange('vote_intent', option.value)}
                          >
                            <div className="flex items-center">
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                                formData.vote_intent === option.value
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300'
                              }`}>
                                {formData.vote_intent === option.value && (
                                  <div className="w-2 h-2 rounded-full bg-white"></div>
                                )}
                              </div>
                              <span>{option.label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* 질문 2: 지지하는 정당 */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">현재 지지하는 정당이 있으신가요?</h3>
                      <div className="space-y-2">
                        {[
                          { label: '더불어민주당 (이재명)', value: 'democratic_party' },
                          { label: '국민의힘 (김문수)', value: 'peoples_power' },
                          { label: '개혁신당 (이준석)', value: 'reform_party' },
                          { label: '민주노동당 (권영국)', value: 'labor_party' },
                          { label: '무소속 (황교안)', value: 'independent_hwang' },
                          { label: '무소속 (송진호)', value: 'independent_song' },
                          { label: '지지하는 후보는 있지만 정당은 없음', value: 'candidate_only' },
                          { label: '지지 정당 없음 / 모르겠음', value: 'no_party' }
                        ].map((option) => (
                          <div
                            key={option.value}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              formData.supported_party === option.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                            onClick={() => handleChange('supported_party', option.value)}
                          >
                            <div className="flex items-center">
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                                formData.supported_party === option.value
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300'
                              }`}>
                                {formData.supported_party === option.value && (
                                  <div className="w-2 h-2 rounded-full bg-white"></div>
                                )}
                              </div>
                              <span>{option.label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* 질문 3: 중요한 이슈 */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">정치에서 가장 중요하게 생각하는 이슈는 무엇인가요?</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: '경제', value: 'economy' },
                          { label: '복지', value: 'welfare' },
                          { label: '공정', value: 'fairness' },
                          { label: '안보', value: 'security' },
                          { label: '기후위기', value: 'climate' },
                          { label: '정치개혁', value: 'political_reform' },
                          { label: '청년정책', value: 'youth_policy' },
                          { label: '기타 / 잘 모르겠다', value: 'other' }
                        ].map((option) => (
                          <div
                            key={option.value}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              formData.key_issue === option.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                            onClick={() => handleChange('key_issue', option.value)}
                          >
                            <div className="flex items-center justify-center">
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${
                                formData.key_issue === option.value
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300'
                              }`}>
                                {formData.key_issue === option.value && (
                                  <div className="w-2 h-2 rounded-full bg-white"></div>
                                )}
                              </div>
                              <span>{option.label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* 질문 4: 거주지역 */}
                  {step === 4 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">현재 거주하시는 지역은 어디인가요?</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: '서울', value: 'seoul' },
                          { label: '경기 / 인천', value: 'gyeonggi' },
                          { label: '강원', value: 'gangwon' },
                          { label: '충청', value: 'chungcheong' },
                          { label: '전라', value: 'jeolla' },
                          { label: '경상', value: 'gyeongsang' },
                          { label: '제주', value: 'jeju' },
                          { label: '해외', value: 'overseas' }
                        ].map((option) => (
                          <div
                            key={option.value}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              formData.region === option.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                            onClick={() => handleChange('region', option.value)}
                          >
                            <div className="flex items-center justify-center">
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${
                                formData.region === option.value
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300'
                              }`}>
                                {formData.region === option.value && (
                                  <div className="w-2 h-2 rounded-full bg-white"></div>
                                )}
                              </div>
                              <span>{option.label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* 질문 5: 연령대 */}
                  {step === 5 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">연령대를 선택해주세요.</h3>
                      <div className="space-y-2">
                        {[
                          { label: '18–29세', value: '18-29' },
                          { label: '30대', value: '30s' },
                          { label: '40대', value: '40s' },
                          { label: '50대', value: '50s' },
                          { label: '60세 이상', value: '60+' }
                        ].map((option) => (
                          <div
                            key={option.value}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              formData.age_group === option.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                            onClick={() => handleChange('age_group', option.value)}
                          >
                            <div className="flex items-center">
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                                formData.age_group === option.value
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300'
                              }`}>
                                {formData.age_group === option.value && (
                                  <div className="w-2 h-2 rounded-full bg-white"></div>
                                )}
                              </div>
                              <span>{option.label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* 질문 6: 성별 */}
                  {step === 6 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">성별을 선택해주세요.</h3>
                      <div className="space-y-2">
                        {[
                          { label: '남성', value: 'male' },
                          { label: '여성', value: 'female' },
                          { label: '선택하지 않음', value: 'prefer_not_to_say' }
                        ].map((option) => (
                          <div
                            key={option.value}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              formData.gender === option.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                            onClick={() => handleChange('gender', option.value)}
                          >
                            <div className="flex items-center">
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                                formData.gender === option.value
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300'
                              }`}>
                                {formData.gender === option.value && (
                                  <div className="w-2 h-2 rounded-full bg-white"></div>
                                )}
                              </div>
                              <span>{option.label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">설문이 완료되었습니다</h3>
                  <p className="text-gray-600 mb-6">
                    당신의 정치적 성향을 바탕으로 맞춤형 후보자를 추천해드립니다
                  </p>
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={goToCandidateRecommendation}
                      className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      후보자 추천받기
                    </button>
                    <button
                      onClick={goToHome}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      홈으로 가기
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* 모달 푸터 - 이동 버튼 */}
            {!complete && (
              <div className="border-t px-6 py-4 flex justify-between">
                <button
                  onClick={prevStep}
                  disabled={step === 1}
                  className={`px-4 py-2 rounded-lg border border-gray-300 ${
                    step === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  이전
                </button>
                <button
                  onClick={nextStep}
                  disabled={
                    (step === 1 && !formData.vote_intent) ||
                    (step === 2 && !formData.supported_party) ||
                    (step === 3 && !formData.key_issue) ||
                    (step === 4 && !formData.region) ||
                    (step === 5 && !formData.age_group) ||
                    (step === 6 && !formData.gender) ||
                    loading ||
                    isSubmitting
                  }
                  className={`px-6 py-2 rounded-lg ${
                    ((step === 1 && !formData.vote_intent) ||
                    (step === 2 && !formData.supported_party) ||
                    (step === 3 && !formData.key_issue) ||
                    (step === 4 && !formData.region) ||
                    (step === 5 && !formData.age_group) ||
                    (step === 6 && !formData.gender) ||
                    loading ||
                    isSubmitting)
                      ? 'bg-black text-white cursor-not-allowed' 
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      처리 중...
                    </div>
                  ) : step === 6 ? '제출하기' : '다음'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PoliticalSurveyModal; 