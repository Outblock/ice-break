'use client';

import { useEffect, useState } from 'react';

const StarsBackground = () => {
  const [stars, setStars] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const generatedStars = [];
    for (let i = 0; i < 30; i++) {
      generatedStars.push(
        <div
          key={i}
          className="star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      );
    }
    setStars(generatedStars);
  }, []);

  return <div id="stars">{stars}</div>;
};

export default StarsBackground;
