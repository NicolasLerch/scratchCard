import { useRef } from 'react';

export default function useSound(src, { loop = false, volume = 1 } = {}) {
  const soundRef = useRef(new Audio(src));

  soundRef.current.loop = loop;
  soundRef.current.volume = volume;

  const play = () => {
    soundRef.current.currentTime = 0;
    soundRef.current.play();
  };

  const stop = () => {
    soundRef.current.pause();
    soundRef.current.currentTime = 0;
  };

  const pause = () => {
    soundRef.current.pause();
  };

  return { play, stop, pause };
}
