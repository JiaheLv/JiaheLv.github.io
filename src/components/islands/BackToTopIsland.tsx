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
      <button
        type="button"
        className="invisible pointer-events-none fixed bottom-[25px] right-[25px] z-[1000] box-border flex h-[45px] w-[45px] translate-y-2 cursor-pointer items-center justify-center rounded-full border-2 border-black bg-[rgba(255,199,110,0.2)] p-0 text-black opacity-0 shadow-[0_4px_15px_rgba(0,0,0,0.2)] transition-[opacity,visibility,transform,background-color] duration-200 ease-in-out data-[visible=true]:visible data-[visible=true]:pointer-events-auto data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 hover:-translate-y-[2px] hover:bg-[rgba(255,199,110,0.35)] focus-visible:-translate-y-[2px] focus-visible:bg-[rgba(255,199,110,0.35)] focus-visible:outline-none"
        data-visible={isVisible}
        aria-label="回到顶部"
        title="回到顶部"
        onClick={scrollToTop}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          className="h-6 w-6"
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
