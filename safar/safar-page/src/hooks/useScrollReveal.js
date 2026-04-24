import { useEffect, useRef } from 'react';

export const useScrollReveal = () => {
  const observerRef = useRef(null);
  const queueRef = useRef([]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe any elements that were registered before the observer was ready
    queueRef.current.forEach(el => observerRef.current.observe(el));
    queueRef.current = [];

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  return (el) => {
    if (el) {
      if (observerRef.current) {
        observerRef.current.observe(el);
      } else {
        queueRef.current.push(el);
      }
    }
  };
};
