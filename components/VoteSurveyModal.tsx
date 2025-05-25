import React from 'react';
import { Modal } from 'antd';
import VoteSurvey from './VoteSurvey';

export default function VoteSurveyModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  return (
    <Modal open={open} onCancel={onClose} footer={null} width={600} destroyOnClose>
      <VoteSurvey onSubmit={onClose} />
    </Modal>
  );
} 