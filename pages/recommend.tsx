import React from 'react';
import RecommendForm from '../components/RecommendForm';

export default function Recommend() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">후보 추천</h1>
      <RecommendForm />
    </div>
  );
} 