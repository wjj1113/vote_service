import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 64, text = '로딩 중...' }) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size }} spin />;

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <Spin indicator={antIcon} />
      <p className="mt-4 text-gray-600">{text}</p>
    </div>
  );
};

export default LoadingSpinner; 