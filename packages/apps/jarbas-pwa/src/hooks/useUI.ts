import { useEffect, useRef } from 'react';

export function useAutoScroll(dependency: any) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldScroll = useRef(true);

  useEffect(() => {
    if (ref.current && shouldScroll.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [dependency]);

  const handleScroll = () => {
    if (!ref.current) return;
    const { scrollTop, scrollHeight, clientHeight } = ref.current;
    shouldScroll.current = scrollHeight - scrollTop - clientHeight < 100;
  };

  return { ref, onScroll: handleScroll };
}

export function useLongPress(callback: () => void, ms = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  return {
    onTouchStart: () => {
      timerRef.current = setTimeout(callback, ms);
    },
    onTouchEnd: () => {
      clearTimeout(timerRef.current);
    },
  };
}
