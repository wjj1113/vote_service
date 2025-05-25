import React from 'react';
import VoteForm from '../components/VoteForm';

export default function Vote() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">투표 의향 조사</h1>
      <VoteForm />
    </div>
  );
} 