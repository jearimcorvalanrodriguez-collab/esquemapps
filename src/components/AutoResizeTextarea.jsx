import React, { useEffect, useRef } from 'react';

export const AutoResizeTextarea = ({ value, onChange, placeholder, className = "" }) => {
  const textareaRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);
  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`resize-none overflow-hidden min-h-[30px] ${className}`}
      rows={1}
    />
  );
};
