import React, { useState } from 'react';
import { CheckCircle2, Circle, AlertCircle, MessageSquare, User, Heart, Briefcase, Flag, Clock } from 'lucide-react';
import { GA_EVENT_DETAILED } from '../lib/gtag';

const valueOptions = [
  { value: '공정', icon: '⚖️', description: '사회적 공정성과 정의' },
  { value: '복지', icon: '🤝', description: '사회 안전망 강화' },
  { value: '경제성장', icon: '📈', description: '국가 경제 발전' },
  { value: '정치개혁', icon: '🏛️', description: '정치 시스템 개선' },
  { value: '안보', icon: '🛡️', description: '국가 안전 보장' },
  { value: '기후', icon: '🌱', description: '환경과 지속가능성' }
];

const interestOptions = [
  { value: '청년', icon: '👥', description: '청년 정책과 지원' },
  { value: '기후', icon: '🌍', description: '기후변화 대응' },
  { value: '노동', icon: '💼', description: '근로자 권익 보호' },
  { value: '교육', icon: '📚', description: '교육 제도 개선' },
  { value: '복지', icon: '🏥', description: '사회복지 확대' },
  { value: '과학기술', icon: '🔬', description: '기술 혁신과 발전' }
];

export default function LightSurveyForm({ onSubmit }: { onSubmit: (answers: any) => void }) {
  const [answers, setAnswers] = useState({
    tendency: '',
    values: [] as string[],
    interests: [] as string[],
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!answers.tendency) {
      newErrors.tendency = '정치 성향을 선택해주세요.';
    }
    if (answers.values.length === 0) {
      newErrors.values = '최소 1개의 가치 기준을 선택해주세요.';
    }
    if (answers.interests.length === 0) {
      newErrors.interests = '최소 1개의 관심 정책을 선택해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(answers);
      GA_EVENT_DETAILED('click_light_survey_submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSelection = (category: 'values' | 'interests', value: string) => {
    setAnswers(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
    if (errors[category]) {
      setErrors(prev => ({ ...prev, [category]: '' }));
    }
    GA_EVENT_DETAILED('click_light_survey_value_' + value);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-gray-900 to-gray-900 rounded-2xl shadow-xl">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
          <Flag className="w-8 h-8 text-gray-900" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">정치 성향 설문조사</h2>
        <p className="text-gray-600">당신의 정치적 가치관과 관심사를 알려주세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 정치 성향 */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-gray-900 mr-2" />
            <label className="text-lg font-semibold text-gray-900">정치 성향</label>
            <span className="text-red-500 ml-1">*</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['진보', '보수', '중도', '실용주의'].map(opt => (
              <label key={opt} className={`
                flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all
                ${answers.tendency === opt 
                  ? 'border-gray-700 bg-gray-700 text-gray-900' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}>
                <input
                  type="radio"
                  name="tendency"
                  value={opt}
                  checked={answers.tendency === opt}
                  onChange={e => {
                    setAnswers(prev => ({ ...prev, tendency: e.target.value }));
                    if (errors.tendency) setErrors(prev => ({ ...prev, tendency: '' }));
                  }}
                  className="sr-only"
                />
                <div className={`
                  w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center
                  ${answers.tendency === opt ? 'border-gray-700 bg-gray-700' : 'border-gray-300'}
                `}>
                  {answers.tendency === opt && <div className="w-2 h-2 bg-gray-900 rounded-full" />}
                </div>
                <span className="font-medium">{opt}</span>
              </label>
            ))}
          </div>
          {errors.tendency && (
            <div className="flex items-center mt-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.tendency}
            </div>
          )}
        </div>

        {/* 가치 기준 */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <Heart className="w-5 h-5 text-red-500 mr-2" />
            <label className="text-lg font-semibold text-gray-900">가치 기준</label>
            <span className="text-red-500 ml-1">*</span>
            <span className="text-sm text-gray-500 ml-2">(복수 선택 가능)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {valueOptions.map(opt => (
              <div
                key={opt.value}
                onClick={() => toggleSelection('values', opt.value)}
                className={`
                  flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${answers.values.includes(opt.value)
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="text-xl mr-3 mt-0.5">{opt.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">{opt.value}</span>
                    <div className="ml-auto">
                      {answers.values.includes(opt.value) ? (
                        <CheckCircle2 className="w-5 h-5 text-red-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{opt.description}</p>
                </div>
              </div>
            ))}
          </div>
          {errors.values && (
            <div className="flex items-center mt-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.values}
            </div>
          )}
        </div>

        {/* 관심 정책 */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <Briefcase className="w-5 h-5 text-green-600 mr-2" />
            <label className="text-lg font-semibold text-gray-900">관심 정책</label>
            <span className="text-red-500 ml-1">*</span>
            <span className="text-sm text-gray-500 ml-2">(복수 선택 가능)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {interestOptions.map(opt => (
              <div
                key={opt.value}
                onClick={() => toggleSelection('interests', opt.value)}
                className={`
                  flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${answers.interests.includes(opt.value)
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="text-xl mr-3 mt-0.5">{opt.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">{opt.value}</span>
                    <div className="ml-auto">
                      {answers.interests.includes(opt.value) ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{opt.description}</p>
                </div>
              </div>
            ))}
          </div>
          {errors.interests && (
            <div className="flex items-center mt-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.interests}
            </div>
          )}
        </div>

        {/* 기타 의견 */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <MessageSquare className="w-5 h-5 text-purple-600 mr-2" />
            <label className="text-lg font-semibold text-gray-900">기타 의견</label>
            <span className="text-sm text-gray-500 ml-2">(선택사항)</span>
          </div>
          <textarea
            value={answers.comment}
            onChange={e => setAnswers(prev => ({ ...prev, comment: e.target.value }))}
            placeholder="추가로 전하고 싶은 의견이 있다면 자유롭게 작성해주세요..."
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent resize-none"
            rows={4}
          />
        </div>

        {/* 제출 버튼 */}
        <button 
          type="submit"
          className={`
            w-full py-4 px-6 rounded-xl font-semibold text-white text-lg transition-all
            ${isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-gray-700 to-gray-700 hover:from-gray-800 hover:to-gray-800 transform hover:scale-105 shadow-lg hover:shadow-xl'
            }
          `}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <Clock className="w-5 h-5 mr-2 animate-spin" />
              제출 중...
            </div>
          ) : (
            '설문 제출하기'
          )}
        </button>
      </form>
    </div>
  );
} 