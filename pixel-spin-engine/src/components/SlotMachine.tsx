'use client';

import { useEffect, useRef, useState } from 'react';
import StarsBackground from './StarsBackground';

const questions = [
    { en: "What's the weirdest food combination you enjoy?", cn: "你喜欢哪种最奇怪的食物搭配？", emoji: "🍕" },
    { en: "If animals could talk, which would be the rudest?", cn: "如果动物会说话，哪一种会最粗鲁？", emoji: "🦙" },
    { en: "What’s the most useless talent you have?", cn: "你拥有的最无用的天赋是什么？", emoji: "🤡" },
    { en: "Pineapple on pizza: Yes or No?", cn: "披萨放菠萝：接受还是拒绝？", emoji: "🍍" },
    { en: "What are you currently addicted to?", cn: "你最近沉迷于什么？", emoji: "🍬" },
    { en: "Tabs or Spaces?", cn: "缩进用 Tab 还是 空格？", emoji: "⌨️" },
    { en: "What app do you use most on your phone?", cn: "你手机上使用频率最高的 App 是哪个？", emoji: "📱" },
    { en: "If you could automate one part of your life, what would it be?", cn: "如果能自动化你生活的一部分，你会选什么？", emoji: "🤖" },
    { en: "Mac, Windows, or Linux?", cn: "Mac, Windows 还是 Linux？", emoji: "💻" },
    { en: "Zombie apocalypse: Weapon of choice?", cn: "僵尸末日来了：你选什么武器？", emoji: "🧟" },
    { en: "Time Travel: Past or Future?", cn: "穿越时空：去过去还是未来？", emoji: "⏳" },
    { en: "Teleport anywhere right now?", cn: "现在想瞬移去哪里？", emoji: "🛸" },
    { en: "Perfect weekend idea?", cn: "你心中完美的周末是怎样的？", emoji: "🏖️" },
    { en: "Saver or Spender?", cn: "你是存钱党还是剁手党？", emoji: "💸" },
    { en: "Cat person or Dog person?", cn: "猫派还是狗派？", emoji: "🐱" },
    { en: "Advice to younger self?", cn: "给年轻的自己一句建议？", emoji: "👶" },
    { en: "Who is your role model?", cn: "谁是你的榜样？", emoji: "🌟" }
];

const SlotMachine = () => {
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
  }, []);

  const getRandomQuestion = () => {
    return questions[Math.floor(Math.random() * questions.length)];
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
