import React, { useState, useEffect, useCallback, useRef } from 'react';

function BackToTopIsland() {
  const [isVisible, setIsVisible] = useState(false);
  const tickingRef = useRef(false);

  const checkVisibility = useCallback(() => {
    const scrollTop = Math.max(
      window.scrollY || 0,
      document.scrollingElement?.scrollTop || 0,
      document.body?.scrollTop || 0
    );
    setIsVisible(scrollTop > 240);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      window.requestAnimationFrame(() => {
        checkVisibility();
        tickingRef.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkVisibility);
    checkVisibility();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkVisibility);
    };
  }, [checkVisibility]);

  const scrollToTop = useCallback(() => {
    const scrollingElement = document.scrollingElement || document.documentElement;
    if (typeof scrollingElement?.scrollTo === 'function') {
      scrollingElement.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (scrollingElement) {
      scrollingElement.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      <style>{`
        .back-to-top-btn {
          position: fixed;
          right: 25px;
          bottom: 25px;
          z-index: 1000;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          padding: 0;
          color: black;
          background-color: rgba(255, 199, 110, 0.2);
          border: 2px solid black;
          border-radius: 999px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transform: translateY(8px);
          transition:
            opacity 200ms ease,
            visibility 200ms ease,
            transform 200ms ease,
            background-color 200ms ease;
        }
        .back-to-top-btn[data-visible="true"] {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
          transform: translateY(0);
        }
        .back-to-top-btn:hover,
        .back-to-top-btn:focus-visible {
          background-color: rgba(255, 199, 110, 0.35);
          outline: none;
          transform: translateY(-2px);
        }
        .back-to-top-btn svg {
          width: 24px;
          height: 24px;
        }
      `}</style>
      <button
        type="button"
        className="back-to-top-btn"
        data-visible={isVisible}
        aria-label="回到顶部"
        title="回到顶部"
        onClick={scrollToTop}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="48"
        >
          <path d="M112 244l144-144 144 144M256 120v292" />
        </svg>
      </button>
    </>
  );
}

export default BackToTopIsland;
