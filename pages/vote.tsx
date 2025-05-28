import React, { useEffect } from 'react';
import VoteForm from '../components/VoteForm';
import { useLoading } from '../contexts/LoadingContext';

export default function Vote() {
  const { setLoading, setLoadingText } = useLoading();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingText('설문 데이터를 불러오는 중...');
        // 여기에 데이터를 불러오는 로직 추가
        // ...
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setLoading, setLoadingText]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">투표 의향 조사</h1>
      <VoteForm />
    </div>
  );
} 