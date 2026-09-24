import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const DesktopModeBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const checkVisibility = () => {
      const isMobileOrTablet = window.innerWidth < 1024;
      const isDismissed = localStorage.getItem('bnj_desktop_banner_dismissed') === 'true';
      
      if (isMobileOrTablet && !isDismissed) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Initial check with a small delay for smooth fade-in
    const timer = setTimeout(checkVisibility, 500);

    // Listen for window resize (helpful for testing on desktop)
    window.addEventListener('resize', checkVisibility);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkVisibility);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('bnj_desktop_banner_dismissed', 'true');
  };

  if (!isVisible) return null;

  const messages = {
    en: "DESKTOP MODE PREFERABLE",
    hi: "डेस्कटॉप मोड बेहतर है",
    te: "డెస్క్‌టాప్ మోడ్ ఉత్తమం"
  };

  const message = messages[language as keyof typeof messages] || messages.en;

  return (
    <div 
      className={`
        lg:hidden w-full bg-terracotta-600 dark:bg-clay-900 text-white 
        h-9 sm:h-10 flex items-center justify-between relative z-[90] overflow-hidden
        transition-all duration-500 ease-in-out border-b border-terracotta-700/50 dark:border-clay-800
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}
      `}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div 
          className={`whitespace-nowrap font-medium text-[11px] sm:text-xs tracking-wide
            ${isHovered ? '[animation-play-state:paused]' : 'animate-marquee'}
            motion-reduce:animate-none motion-reduce:whitespace-normal motion-reduce:text-center motion-reduce:w-full
          `}
        >
          <span>{message}</span>
        </div>
      </div>
      
      <button 
        onClick={handleDismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all z-10 bg-terracotta-600 dark:bg-clay-900"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 12s linear infinite;
        }
      `}</style>
    </div>
  );
};
