import React, { useState, createContext, useContext } from 'react';
import Footer from './Footer';
import FeedbackModal from './FeedbackModal';

export const FeedbackModalContext = createContext<() => void>(() => {});

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  const handleFeedbackClick = () => setIsFeedbackModalOpen(true);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <FeedbackModalContext.Provider value={handleFeedbackClick}>
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          {children}
        </main>
        <Footer onFeedbackClick={handleFeedbackClick} />
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          onSubmit={async (feedback: string) => {
            try {
              const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feedback }),
              });
              if (!response.ok) throw new Error('피드백 제출에 실패했습니다.');
              showNotification('소중한 피드백 감사합니다!', 'success');
            } catch (error) {
              showNotification('피드백 제출 중 오류가 발생했습니다.', 'error');
            }
          }}
        />
        {showToast && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            toastType === 'success' ? 'bg-green-500' :
            toastType === 'error' ? 'bg-red-500' :
            'bg-gray-900'
          } text-white`}>
            {toastMessage}
          </div>
        )}
      </div>
    </FeedbackModalContext.Provider>
  );
} 