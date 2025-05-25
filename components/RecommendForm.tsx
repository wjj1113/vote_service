import React, { useState } from 'react';

export default function RecommendForm() {
  const [userInput, setUserInput] = useState('');
  const [recommendation, setRecommendation] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInput }),
    });
    const data = await res.json();
    setRecommendation(data.recommendation);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="정책 선호도를 입력하세요..."
        />
        <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
          추천받기
        </button>
      </form>
      {recommendation && (
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold">추천 결과:</h2>
          <p>{recommendation}</p>
        </div>
      )}
    </div>
  );
} 