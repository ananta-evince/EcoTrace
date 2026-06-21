'use client';

import { useEffect, useState } from 'react';

type StreamingTextProps = {
  content: string;
};

export function StreamingText({ content }: StreamingTextProps) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    const words = content.split(' ');
    let i = 0;
    const interval = setInterval(() => {
      if (i < words.length) {
        setDisplayed((prev) => (prev ? `${prev} ${words[i]}` : (words[i] ?? '')));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [content]);

  return (
    <div
      role="log"
      aria-live="polite"
      aria-atomic="false"
      className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700 dark:prose-invert dark:text-gray-300 motion-reduce:transition-none"
    >
      {displayed}
    </div>
  );
}
