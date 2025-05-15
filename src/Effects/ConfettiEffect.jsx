// src/components/ConfettiEffect.jsx
import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

const ConfettiEffect = ({ duration = 5000 }) => {
  const [isRunning, setIsRunning] = useState(true);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);

    const timer = setTimeout(() => {
      setIsRunning(false);
    }, duration);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [duration]);

  return isRunning ? (
    <Confetti
      width={dimensions.width}
      height={dimensions.height}
      numberOfPieces={300}
      gravity={0.2}
      recycle={false}
    />
  ) : null;
};

export default ConfettiEffect;
