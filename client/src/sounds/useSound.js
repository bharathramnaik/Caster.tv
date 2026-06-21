import { useCallback, useEffect, useState } from 'react';
import { SoundManager } from './soundManager.js';

export function useSound() {
  const [muted, setMuted] = useState(SoundManager.isMuted());
  const [volume, setVolumeState] = useState(SoundManager.getVolume());

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      SoundManager.mute();
      setMuted(true);
    }
  }, []);

  const playClick = useCallback(() => SoundManager.play('click'), []);
  const playSuccess = useCallback(() => SoundManager.play('success'), []);
  const playError = useCallback(() => SoundManager.play('error'), []);
  const playNotification = useCallback(() => SoundManager.play('notification'), []);
  const playScore = useCallback(() => SoundManager.play('score'), []);
  const playWicket = useCallback(() => SoundManager.play('wicket'), []);
  const playTransition = useCallback(() => SoundManager.play('transition'), []);
  const playStart = useCallback(() => SoundManager.play('start'), []);
  const playStop = useCallback(() => SoundManager.play('stop'), []);

  const toggleMute = useCallback(() => {
    const newMuted = SoundManager.toggleMute();
    setMuted(newMuted);
  }, []);

  const setVolume = useCallback((level) => {
    SoundManager.setVolume(level);
    setVolumeState(level);
  }, []);

  return {
    playClick,
    playSuccess,
    playError,
    playNotification,
    playScore,
    playWicket,
    playTransition,
    playStart,
    playStop,
    toggleMute,
    setVolume,
    muted,
    volume
  };
}
