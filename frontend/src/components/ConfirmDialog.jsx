import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const variantStyles = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    info: 'bg-cyan-600 hover:bg-cyan-700 text-white',
  };

  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={isLoading}
        className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
      >
        {cancelText}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isLoading}
        className={`px-4 py-2 text-xs font-medium rounded-lg transition shadow-xs ${variantStyles[variant] || variantStyles.danger}`}
      >
        {isLoading ? 'Processing...' : confirmText}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer} maxWidth="max-w-md">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-rose-50 text-rose-600 rounded-full shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <p className="text-xs text-slate-600 leading-relaxed mt-1">{message}</p>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
