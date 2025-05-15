// src/components/FireworksEffect.jsx
import { Fireworks } from '@fireworks-js/react';

const FireworksEffect = () => {
  return (
    <Fireworks
      options={{
        hue: { min: 0, max: 360 },
        delay: { min: 15, max: 30 },
        rocketsPoint: { min: 0, max: 100 },
        speed: 2,
        acceleration: 1.05,
        friction: 0.95,
        gravity: 1.5,
        particles: 50,
        trace: 3,
        explosion: 5,
        autoresize: true,
        brightness: {
          min: 50,
          max: 80,
          decay: { min: 0.015, max: 0.03 },
        },
        boundaries: {
          x: 50,
          y: 50,
          width: window.innerWidth,
          height: window.innerHeight,
        },
      }}
      style={{
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        position: 'fixed',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  );
};

export default FireworksEffect;
