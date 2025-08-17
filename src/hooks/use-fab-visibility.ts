import { useState, useEffect, useCallback } from 'react';

interface UseFabVisibilityOptions {
  fadeDelay?: number;
  fadeOpacity?: 'faded' | 'subtle';
  fullOpacity?: 'full';
  enableAutoFade?: boolean;
}

export const useFabVisibility = ({
  fadeDelay = 2000,
  fadeOpacity = 'faded',
  fullOpacity = 'full',
  enableAutoFade = true
}: UseFabVisibilityOptions = {}) => {
  const [opacity, setOpacity] = useState<'full' | 'faded' | 'subtle'>(fullOpacity);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Timer for auto-fading
  const [fadeTimer, setFadeTimer] = useState<NodeJS.Timeout | null>(null);

  const resetFadeTimer = useCallback(() => {
    if (fadeTimer) {
      clearTimeout(fadeTimer);
    }
    
    if (enableAutoFade && !isHovered && !isFocused && !isActive) {
      const timer = setTimeout(() => {
        setOpacity(fadeOpacity);
      }, fadeDelay);
      setFadeTimer(timer);
    }
  }, [fadeTimer, enableAutoFade, isHovered, isFocused, isActive, fadeDelay, fadeOpacity]);

  const showFab = useCallback(() => {
    setOpacity(fullOpacity);
    resetFadeTimer();
  }, [fullOpacity, resetFadeTimer]);

  const hideFab = useCallback(() => {
    setOpacity(fadeOpacity);
  }, [fadeOpacity]);

  // Handle user activity
  useEffect(() => {
    if (!enableAutoFade) return;

    const handleUserActivity = () => {
      showFab();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [enableAutoFade, showFab]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (fadeTimer) {
        clearTimeout(fadeTimer);
      }
    };
  }, [fadeTimer]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    showFab();
  }, [showFab]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    resetFadeTimer();
  }, [resetFadeTimer]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    showFab();
  }, [showFab]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    resetFadeTimer();
  }, [resetFadeTimer]);

  const handleMouseDown = useCallback(() => {
    setIsActive(true);
    showFab();
  }, [showFab]);

  const handleMouseUp = useCallback(() => {
    setIsActive(false);
    resetFadeTimer();
  }, [resetFadeTimer]);

  return {
    opacity,
    showFab,
    hideFab,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
    }
  };
};
