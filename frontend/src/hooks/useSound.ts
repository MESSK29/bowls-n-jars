import { useState, useCallback } from 'react';
import { ceramicAudio } from '../utils/sound';

export function useSound() {
  const [isMuted, setIsMuted] = useState<boolean>(() => ceramicAudio.getIsMuted());

  const toggleMute = useCallback(() => {
    const updated = ceramicAudio.toggleMute();
    setIsMuted(updated);
    return updated;
  }, []);

  const playTap = useCallback(() => {
    ceramicAudio.playTap();
  }, []);

  const playClink = useCallback(() => {
    ceramicAudio.playClink();
  }, []);

  const playSlide = useCallback(() => {
    ceramicAudio.playSlide();
  }, []);

  const playGlazeChime = useCallback(() => {
    ceramicAudio.playGlazeChime();
  }, []);

  return {
    isMuted,
    toggleMute,
    playTap,
    playClink,
    playSlide,
    playGlazeChime,
  };
}
