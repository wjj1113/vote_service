import React, { createContext, useContext, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import AnalyzingState from '../components/AnalyzingState';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  loadingText: string;
  setLoadingText: (text: string) => void;
  isAnalyzing: boolean;
  setAnalyzing: (analyzing: boolean) => void;
  analysisProgress: number;
  setAnalysisProgress: (progress: number) => void;
  analysisKeywords: string[];
  setAnalysisKeywords: (keywords: string[]) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('로딩 중...');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisKeywords, setAnalysisKeywords] = useState<string[]>([]);

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        setLoading: setIsLoading,
        loadingText,
        setLoadingText,
        isAnalyzing,
        setAnalyzing: setIsAnalyzing,
        analysisProgress,
        setAnalysisProgress,
        analysisKeywords,
        setAnalysisKeywords,
      }}
    >
      {children}
      {isLoading && !isAnalyzing && <LoadingSpinner text={loadingText} />}
      {isAnalyzing && (
        <AnalyzingState
          progress={analysisProgress}
          keywords={analysisKeywords}
        />
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export { LoadingContext }; 