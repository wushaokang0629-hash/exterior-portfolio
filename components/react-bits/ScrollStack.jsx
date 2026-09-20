'use client';

import { Children, useEffect, useMemo, useRef, useState } from 'react';
import './ScrollStack.css';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const pad = value => String(value).padStart(2, '0');

const ScrollStack = ({
  items = [],
  children,
  variant = 'stack',
  scrollLength = 1,
  peek = 26,
  scaleStep = 0.07,
  blur = 4,
  dim = 0.28,
  smooth = 0.16,
  depth = 3,
  cardWidth = 880,
  cardHeight = 0.68,
  borderRadius = 22,
  perspective = 1400,
  showProgress = true,
  showCounter = true,
  onIndexChange,
  className = ''
}) => {
  const rootRef = useRef(null);
  const progressRef = useRef(0);
  const displayedRef = useRef(0);
  const targetRef = useRef(0);
  const frameRef = useRef(null);
  const lastIndexRef = useRef(0);
  const [progress, setProgress] = useState(0);

  const customCards = children ? Children.toArray(children) : null;
  const cards = customCards || items;
  const count = cards.length;

  const sectionHeight = useMemo(
    () => `${Math.max(1, count * Math.max(0.2, scrollLength) + 0.55) * 100}vh`,
    [count, scrollLength]
  );

  useEffect(() => {
    const updateTarget = () => {
      const root = rootRef.current;
      if (!root || count < 2) return;
      const rect = root.getBoundingClientRect();
      const runway = Math.max(1, root.offsetHeight - window.innerHeight);
      targetRef.current = clamp(-rect.top / runway, 0, 1) * (count - 1);
    };

    const tick = () => {
      const follow = smooth <= 0 ? 1 : clamp(smooth, 0.02, 1);
      const next = progressRef.current + (targetRef.current - progressRef.current) * follow;
      progressRef.current = Math.abs(next - targetRef.current) < 0.0005 ? targetRef.current : next;

      const index = clamp(Math.floor(progressRef.current + 0.5), 0, Math.max(0, count - 1));
      if (index !== lastIndexRef.current) {
        lastIndexRef.current = index;
        onIndexChange?.(index);
      }

      if (Math.abs(displayedRef.current - progressRef.current) > 0.0005) {
        displayedRef.current = progressRef.current;
        setProgress(progressRef.current);
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    updateTarget();
    window.addEventListener('scroll', updateTarget, { passive: true });
    window.addEventListener('resize', updateTarget);
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', updateTarget);
      window.removeEventListener('resize', updateTarget);
      cancelAnimationFrame(frameRef.current);
    };
  }, [count, onIndexChange, smooth]);

  if (!count) return null;

  const activeIndex = clamp(Math.floor(progress + 0.5), 0, count - 1);
  const runwayProgress = count > 1 ? progress / (count - 1) : 1;

  const getCardStyle = index => {
    const relative = index - progress;
    const covered = Math.max(0, -relative);
    const ahead = Math.max(0, relative);
    const stackDepth = Math.min(depth, covered);
    const isTooFarBehind = covered > depth + 0.9;
    const isTooFarAhead = ahead > 1.4;
    const incoming = clamp(ahead, 0, 1);

    let translateY = covered > 0 ? -stackDepth * peek : incoming * 82;
    let translateX = 0;
    let rotateX = 0;
    let rotateZ = covered > 0 ? -stackDepth * 0.45 : 0;
    let scale = 1 - stackDepth * scaleStep;
    let opacity = isTooFarBehind || isTooFarAhead ? 0 : 1;

    if (variant === 'deck') {
      translateX = covered > 0 ? -stackDepth * peek * 1.35 : incoming * 18;
      translateY = covered > 0 ? stackDepth * 8 : incoming * 74;
      rotateZ = covered > 0 ? -stackDepth * 1.5 : incoming * 2;
    } else if (variant === 'fade') {
      translateY = relative * 18;
      scale = 1;
      opacity = clamp(1 - Math.abs(relative), 0, 1);
    } else if (variant === 'flip') {
      translateY = covered > 0 ? -stackDepth * peek : incoming * 64;
      rotateX = incoming * -72 + stackDepth * 5;
    } else if (variant === 'zoom') {
      translateY = incoming * 24;
      scale = covered > 0 ? Math.max(0.62, 1 - covered * scaleStep * 1.7) : 1 + incoming * 0.2;
      opacity = isTooFarBehind || isTooFarAhead ? 0 : clamp(1 - incoming * 0.25, 0, 1);
    } else if (variant === 'reveal') {
      translateY = covered > 0 ? -stackDepth * peek : incoming * 96;
      scale = 1 - stackDepth * scaleStep * 0.45;
    }

    return {
      '--scroll-stack-order': index,
      '--scroll-stack-accent': customCards ? '#B497CF' : cards[index]?.accent || '#B497CF',
      opacity,
      visibility: opacity === 0 ? 'hidden' : 'visible',
      zIndex: index + 1,
      transform: `translate3d(${translateX}px, ${translateY}vh, ${-stackDepth * 42}px) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg) scale(${Math.max(0.42, scale)})`,
      filter: blur > 0 && covered > 0 ? `blur(${Math.min(blur, covered * blur)}px) brightness(${Math.max(0.28, 1 - Math.min(1, covered) * dim)})` : undefined,
      pointerEvents: index === activeIndex ? 'auto' : 'none'
    };
  };

  return (
    <section
      ref={rootRef}
      className={`scroll-stack scroll-stack--${variant} ${className}`.trim()}
      style={{
        height: sectionHeight,
        '--scroll-stack-width': `${cardWidth}px`,
        '--scroll-stack-height': `${cardHeight * 100}svh`,
        '--scroll-stack-radius': `${borderRadius}px`,
        '--scroll-stack-perspective': `${perspective}px`
      }}
      aria-label="项目效果图滚动展示"
    >
      <div className="scroll-stack__stage">
        <div className="scroll-stack__cards">
          {cards.map((card, index) => (
            <article className="scroll-stack__card" style={getCardStyle(index)} key={card?.image || card?.key || index}>
              {customCards ? card : (
                <>
                  <img src={card.image} alt={card.alt || card.title || `项目效果图 ${index + 1}`} loading={index < 2 ? 'eager' : 'lazy'} />
                  <div className="scroll-stack__shade" />
                  <div className="scroll-stack__meta">
                    <p>{card.eyebrow || `PROJECT IMAGE ${pad(index + 1)}`}</p>
                    <h2>{card.title}</h2>
                    {card.body && <span>{card.body}</span>}
                  </div>
                  <div className="scroll-stack__number">{pad(index + 1)}</div>
                </>
              )}
            </article>
          ))}
        </div>

        {(showProgress || showCounter) && (
          <div className="scroll-stack__status" aria-live="polite">
            {showCounter && <span>{pad(activeIndex + 1)} / {pad(count)}</span>}
            {showProgress && (
              <div className="scroll-stack__rail" aria-hidden="true">
                <i style={{ transform: `scaleX(${runwayProgress})` }} />
              </div>
            )}
            <span className="scroll-stack__hint">向下滚动浏览</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default ScrollStack;
