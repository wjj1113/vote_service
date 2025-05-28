import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const GPTRecommendation: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('분석 준비 중...');
  const navigate = useNavigate();

  // 임시로 하드코딩된 userId 사용 (실제로는 인증 시스템에서 가져와야 함)
  const userId = 'test_user';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('파일을 선택해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisStatus('분석 준비 중...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('user_id', userId);

      setAnalysisStatus('파일 업로드 중...');
      const uploadResponse = await axios.post(
        `${API_BASE_URL}/api/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (uploadResponse.data.success) {
        setAnalysisStatus('데이터 분석 중...');
        const analysisResponse = await axios.post(
          `${API_BASE_URL}/api/analyze`,
          {
            user_id: userId,
            file_name: uploadResponse.data.file_name,
          }
        );

        if (analysisResponse.data.success) {
          setAnalysisStatus('분석 완료!');
          // 분석이 완료되면 즉시 결과 페이지로 이동
          navigate('/recommendation-result');
        } else {
          throw new Error(analysisResponse.data.error || '분석 중 오류가 발생했습니다.');
        }
      } else {
        throw new Error(uploadResponse.data.error || '파일 업로드 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">AI 추천 서비스</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            파일 선택
          </label>
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="mt-1 block w-full"
            accept=".csv,.xlsx"
          />
        </div>
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        {loading && (
          <div className="text-blue-500 text-sm">
            {analysisStatus}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
        >
          {loading ? '처리 중...' : '결과 분석하기'}
        </button>
        {loading && (
          <div className="text-gray-500 text-sm mt-2 text-center">
            10초만 기다려주세요!
          </div>
        )}
      </form>
    </div>
  );
};

export default GPTRecommendation; 