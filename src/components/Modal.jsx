"use client";
// Modal component (client) - simple image preview modal
import { useEffect } from 'react';

export default function Modal({ src, alt, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!src) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative mx-4 w-full max-w-4xl overflow-hidden rounded-2xl border border-white/30 bg-white" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-lg font-semibold text-white"
        >
          x
        </button>
        <img src={src} alt={alt} className="h-auto max-h-[80vh] w-full object-contain bg-black/5" />
      </div>
    </div>
  );
}
