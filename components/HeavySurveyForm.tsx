import React, { useState } from 'react';
import { CheckCircle2, Circle, AlertCircle, MessageSquare, User, Briefcase, Flag, Clock } from 'lucide-react';
import { GA_EVENT_DETAILED } from '../lib/gtag';

interface SurveyAnswers {
  lifestyle: string;
  policyPriority: string[];
  extraComment: string;
}

interface SurveyFormProps {
  onSubmit: (answers: SurveyAnswers) => void;
  initialAnswers: Partial<SurveyAnswers>;
}

const lifestyleOptions = [
  { value: '워킹맘', icon: '👩‍💼', description: '일하는 어머니' },
  { value: '1인가구', icon: '🏠', description: '혼자 사는 가구' },
  { value: '자영업', icon: '🏪', description: '개인 사업 운영' },
  { value: '학생', icon: '🎓', description: '재학 중인 학생' },
  { value: '직장인', icon: '💻', description: '회사 근무자' },
  { value: '기타', icon: '👤', description: '기타 라이프스타일' }
];

const policyPriorityOptions = [
  { value: '복지', icon: '🤲', description: '사회복지 정책' },
  { value: '경제', icon: '💰', description: '경제 정책' },
  { value: '안보', icon: '🛡️', description: '국가 안보' },
  { value: '기후', icon: '🌿', description: '환경 정책' },
  { value: '교육', icon: '📖', description: '교육 정책' },
  { value: '정치개혁', icon: '⚡', description: '정치 개혁' }
];

export default function HeavySurveyForm({
  onSubmit,
  initialAnswers,
}: SurveyFormProps) {
  const [answers, setAnswers] = useState<SurveyAnswers>({
    lifestyle: '',
    policyPriority: [],
    extraComment: '',
    ...initialAnswers,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!answers.lifestyle) {
      newErrors.lifestyle = '라이프스타일을 선택해주세요.';
    }
    if (answers.policyPriority.length === 0) {
      newErrors.policyPriority = '최소 1개의 정책 우선순위를 선택해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !validateForm()) return;
    
    setIsSubmitting(true);
    try {
      GA_EVENT_DETAILED('click_heavy_survey_submit');
      await onSubmit(answers);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePolicyPriority = (value: string) => {
    setAnswers((prev: SurveyAnswers) => ({
      ...prev,
      policyPriority: prev.policyPriority.includes(value)
        ? prev.policyPriority.filter((v: string) => v !== value)
        : [...prev.policyPriority, value]
    }));
    if (errors.policyPriority) {
      setErrors((prev: {[key: string]: string}) => ({ ...prev, policyPriority: '' }));
    }
    GA_EVENT_DETAILED('click_heavy_survey_lifestyle_' + value);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <Briefcase className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">상세 설문조사</h2>
        <p className="text-gray-600">추가 정보를 통해 더 정확한 분석을 도와드려요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 라이프스타일 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-purple-600 mr-2" />
            <label className="text-lg font-semibold text-gray-800">라이프스타일</label>
            <span className="text-red-500 ml-1">*</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lifestyleOptions.map(opt => (
              <label
                key={opt.value}
                className={`
                  flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${answers.lifestyle === opt.value
                    ? 'border-purple-500 bg-purple-50 text-purple-700' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <input
                  type="radio"
                  name="lifestyle"
                  value={opt.value}
                  checked={answers.lifestyle === opt.value}
                  onChange={e => {
                    setAnswers(prev => ({ ...prev, lifestyle: e.target.value }));
                    if (errors.lifestyle) setErrors(prev => ({ ...prev, lifestyle: '' }));
                  }}
                  className="sr-only"
                />
                <div className="text-xl mr-3">{opt.icon}</div>
                <div className="flex-1">
                  <div className="font-medium">{opt.value}</div>
                  <p className="text-sm text-gray-600">{opt.description}</p>
                </div>
                <div className={`
                  w-4 h-4 rounded-full border-2 ml-3
                  ${answers.lifestyle === opt.value ? 'border-purple-500 bg-purple-500' : 'border-gray-300'}
                `}>
                  {answers.lifestyle === opt.value && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                </div>
              </label>
            ))}
          </div>
          {errors.lifestyle && (
            <div className="flex items-center mt-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.lifestyle}
            </div>
          )}
        </div>

        {/* 정책 우선순위 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <Flag className="w-5 h-5 text-indigo-600 mr-2" />
            <label className="text-lg font-semibold text-gray-800">정책 우선순위</label>
            <span className="text-red-500 ml-1">*</span>
            <span className="text-sm text-gray-500 ml-2">(복수 선택 가능)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {policyPriorityOptions.map(opt => (
              <div
                key={opt.value}
                onClick={() => togglePolicyPriority(opt.value)}
                className={`
                  flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${answers.policyPriority.includes(opt.value)
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="text-xl mr-3 mt-0.5">{opt.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-800">{opt.value}</span>
                    <div className="ml-auto">
                      {answers.policyPriority.includes(opt.value) ? (
                        <CheckCircle2 className="w-5 h-5 text-indigo-500" />
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
          {errors.policyPriority && (
            <div className="flex items-center mt-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.policyPriority}
            </div>
          )}
        </div>

        {/* 추가 의견 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <MessageSquare className="w-5 h-5 text-pink-600 mr-2" />
            <label className="text-lg font-semibold text-gray-800">추가 의견</label>
            <span className="text-sm text-gray-500 ml-2">(선택사항)</span>
          </div>
          <textarea
            value={answers.extraComment}
            onChange={e => setAnswers(prev => ({ ...prev, extraComment: e.target.value }))}
            placeholder="정책이나 정치에 대한 추가적인 생각을 자유롭게 공유해주세요..."
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
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
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
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
            '설문 완료하기'
          )}
        </button>
      </form>
    </div>
  );
} 