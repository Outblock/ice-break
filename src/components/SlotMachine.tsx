'use client';

import { useEffect, useRef, useState } from 'react';
import StarsBackground from './StarsBackground';
import { soundManager } from '../utils/audio';

interface Question {
  en: string;
  cn: string;
  emoji: string;
  category?: string;
}

const CATEGORIES = ['ALL', 'FUN', 'TECH', 'DEEP', 'LIFE', 'FOOD'];

const SlotMachine = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['ALL']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinBtnText, setSpinBtnText] = useState('SPIN THE REEL');
  const [card1Data, setCard1Data] = useState({
    en: 'READY?',
    cn: '点击按钮启动',
    emoji: '🎰',
  });
  const [card2Data, setCard2Data] = useState({
    en: '',
    cn: '',
    emoji: '',
  });

  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const pointerLeftRef = useRef<HTMLDivElement>(null);
  const pointerRightRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);

  let activeCardRef = useRef<HTMLDivElement | null>(null);
  let nextCardRef = useRef<HTMLDivElement | null>(null);

  let animationId = useRef<number | null>(null);
  let currentOffset = useRef(0);
  let speed = useRef(0);
  let phase = useRef('idle');
  let totalDistance = useRef(0);

  const MAX_SPEED = 45;
  const ACCELERATION = 0.8;
  const FRICTION = 0.96;
  const STOP_THRESHOLD = 2;

  useEffect(() => {
    activeCardRef.current = card1Ref.current;
    nextCardRef.current = card2Ref.current;

    fetch('/questions.json')
      .then((res) => res.json())
      .then((data) => setQuestions(data))
      .catch((err) => console.error('Failed to load questions:', err));
  }, []);

  const getRandomQuestion = () => {
    if (questions.length === 0) return { en: 'Loading...', cn: '加载中...', emoji: '⌛' };

    let filteredQuestions = questions;
    if (!selectedCategories.includes('ALL')) {
      filteredQuestions = questions.filter(q => q.category && selectedCategories.includes(q.category));
    }

    // Fallback if filtering results in no questions (shouldn't happen with correct logic but safe to have)
    if (filteredQuestions.length === 0) {
      filteredQuestions = questions;
    }

    return filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
  };

  const toggleCategory = (cat: string) => {
    if (isSpinning) return;

    soundManager.playTick(); // Use tick sound for button press

    setSelectedCategories(prev => {
      if (cat === 'ALL') {
        return ['ALL'];
      }

      let newCats = prev.filter(c => c !== 'ALL');
      if (prev.includes(cat)) {
        newCats = newCats.filter(c => c !== cat);
      } else {
        newCats.push(cat);
      }

      if (newCats.length === 0) {
        return ['ALL'];
      }

      return newCats;
    });
  };

  const updateCardContent = (card: 'card1' | 'card2', data: typeof questions[0]) => {
    if (card === 'card1') {
      setCard1Data(data);
    } else {
      setCard2Data(data);
    }
  };

  const initSpin = () => {
    if (isSpinning) return;
    soundManager.resume();
    soundManager.playSpinStart();
    setIsSpinning(true);
    setSpinBtnText('ACCELERATING...');

    if (activeCardRef.current) activeCardRef.current.classList.remove('bounce-lock');
    if (nextCardRef.current) nextCardRef.current.classList.remove('bounce-lock');

    updateCardContent('card2', getRandomQuestion());

    phase.current = 'accelerate';
    speed.current = 0;
    currentOffset.current = 0;
    totalDistance.current = 0;

    loop();
  };

  const loop = () => {
    if (phase.current === 'accelerate') {
      speed.current += ACCELERATION;
      if (speed.current >= MAX_SPEED) {
        speed.current = MAX_SPEED;
        phase.current = 'constant';
        setSpinBtnText('MAX SPEED!');
        setTimeout(() => {
          phase.current = 'decelerate';
          setSpinBtnText('BRAKING...');
        }, 1500);
      }
    } else if (phase.current === 'decelerate') {
      speed.current *= FRICTION;
      if (speed.current < STOP_THRESHOLD) {
        speed.current = STOP_THRESHOLD;
        phase.current = 'stopping';
      }
    }

    currentOffset.current += speed.current;
    totalDistance.current += speed.current;

    if (speed.current > 0.5) {
      const baseAmp = 15;
      const amp = baseAmp + (speed.current / MAX_SPEED) * 10;
      const tick = Math.sin(totalDistance.current * 0.25);
      const angleLeft = tick * amp;
      const angleRight = -tick * amp;
      if (pointerLeftRef.current) pointerLeftRef.current.style.transform = `rotate(${angleLeft}deg)`;
      if (pointerRightRef.current) pointerRightRef.current.style.transform = `scaleX(-1) rotate(${angleRight}deg)`;
    } else {
      if (pointerLeftRef.current) pointerLeftRef.current.style.transform = `rotate(0deg)`;
      if (pointerRightRef.current) pointerRightRef.current.style.transform = `scaleX(-1) rotate(0deg)`;
    }

    const blurAmount = Math.min(speed.current / 8, 4);
    if (activeCardRef.current) activeCardRef.current.style.filter = `blur(${blurAmount}px)`;
    if (nextCardRef.current) nextCardRef.current.style.filter = `blur(${blurAmount}px)`;

    if (currentOffset.current >= 100) {
      currentOffset.current -= 100;
      soundManager.playTick();

      const temp = activeCardRef.current;
      activeCardRef.current = nextCardRef.current;
      nextCardRef.current = temp;

      const nextData = getRandomQuestion();
      if (nextCardRef.current === card1Ref.current) {
        updateCardContent('card1', nextData);
      } else {
        updateCardContent('card2', nextData);
      }


      if (phase.current === 'stopping') {
        finalizeStop();
        return;
      }
    }

    if (activeCardRef.current) activeCardRef.current.style.transform = `translate3d(0, ${currentOffset.current}%, 0)`;
    if (nextCardRef.current) nextCardRef.current.style.transform = `translate3d(0, ${currentOffset.current - 100}%, 0)`;

    animationId.current = requestAnimationFrame(loop);
  };

  const finalizeStop = () => {
    soundManager.playWin();
    if (animationId.current) cancelAnimationFrame(animationId.current);

    if (activeCardRef.current) activeCardRef.current.style.transform = `translate3d(0, 0%, 0)`;
    if (nextCardRef.current) nextCardRef.current.style.transform = `translate3d(0, -100%, 0)`;

    if (activeCardRef.current) activeCardRef.current.style.filter = 'none';
    if (nextCardRef.current) nextCardRef.current.style.filter = 'none';

    if (pointerLeftRef.current) pointerLeftRef.current.style.transform = `rotate(0deg)`;
    if (pointerRightRef.current) pointerRightRef.current.style.transform = `scaleX(-1) rotate(0deg)`;

    if (activeCardRef.current) activeCardRef.current.classList.add('bounce-lock');

    setSpinBtnText('SPIN AGAIN');
    setIsSpinning(false);
    phase.current = 'idle';

    if (screenRef.current) {
      screenRef.current.style.borderColor = '#fff';
      setTimeout(() => {
        if (screenRef.current) screenRef.current.style.borderColor = '#333';
      }, 100);
    }
  };

  return (
    <div>
      <StarsBackground />
      <div className="container">
          <div className="corner tl"></div><div className="corner tr"></div>
          <div className="corner bl"></div><div className="corner br"></div>

          <h1><span style={{color:'var(--neon-green)'}}>&gt;</span> PIXEL.SPIN_ENGINE<span className="blink">_</span></h1>

          <div className="category-filters" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '20px',
            maxWidth: '100%'
          }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                disabled={isSpinning}
                style={{
                  fontFamily: 'var(--font-press-start-2p)',
                  fontSize: '0.6rem',
                  padding: '8px 12px',
                  border: '2px solid #333',
                  backgroundColor: selectedCategories.includes(cat) ? 'var(--neon-green)' : '#fff',
                  color: selectedCategories.includes(cat) ? '#000' : '#333',
                  cursor: isSpinning ? 'not-allowed' : 'pointer',
                  boxShadow: selectedCategories.includes(cat)
                    ? 'inset 2px 2px 0px rgba(255,255,255,0.5), inset -2px -2px 0px rgba(0,0,0,0.2)'
                    : '4px 4px 0px #333',
                  transform: selectedCategories.includes(cat) ? 'translate(2px, 2px)' : 'none',
                  transition: 'all 0.1s',
                  textTransform: 'uppercase'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="question-screen" id="screen" ref={screenRef}>
              <div className="pointer pointer-left" id="pointerLeft" ref={pointerLeftRef}></div>
              <div className="pointer pointer-right" id="pointerRight" ref={pointerRightRef}></div>

              <div className="card" id="card1" ref={card1Ref}>
                  <span className="emoji">{card1Data.emoji}</span>
                  <div className="q-en">{card1Data.en}</div>
                  <div className="q-cn">{card1Data.cn}</div>
              </div>
              <div className="card" id="card2" ref={card2Ref} style={{ transform: 'translateY(-100%)' }}>
                  <span className="emoji">{card2Data.emoji}</span>
                  <div className="q-en">{card2Data.en}</div>
                  <div className="q-cn">{card2Data.cn}</div>
              </div>
          </div>

          <button className="btn-pixel" id="spinBtn" onClick={initSpin} disabled={isSpinning}>
              {spinBtnText}
          </button>
      </div>
    </div>
  );
};

export default SlotMachine;
