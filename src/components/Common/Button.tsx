import React from 'react';

type ButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

export default function Button({
  onClick,
  children,
  className = '',
  disabled = false
}: ButtonProps) {
  return (
    <button
      className={`flex-1 py-3 text-sm font-medium text-white transition shadow rounded-xl active:scale-95 ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
