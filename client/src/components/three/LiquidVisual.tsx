import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';

const Scene = lazy(() => import('./LiquidScene'));
class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="pf-orb-fallback" />
    ) : (
      this.props.children
    );
  }
}
export function LiquidVisual() {
  const element = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(false);
  useEffect(() => {
    const target = element.current;
    if (!target) return;
    let visible = false;
    const media = window.matchMedia('(min-width: 768px)');
    const update = () =>
      setActive(visible && media.matches && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(target);
    media.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      media.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  return (
    <div ref={element} className="pf-liquid-visual" aria-hidden="true">
      <div className="pf-orbit pf-orbit--one" />
      <div className="pf-orbit pf-orbit--two" />
      <div className="pf-scene">
        {active && reduced === false ? (
          <SceneBoundary>
            <Suspense fallback={<div className="pf-orb-fallback" />}>
              <Scene />
            </Suspense>
          </SceneBoundary>
        ) : (
          <div className="pf-orb-fallback" />
        )}
      </div>
      <div className="pf-visual-label">
        <span /> IDEAS INTO INTERFACES
      </div>
      <span className="pf-coordinate">01 / DIGITAL MATTER</span>
    </div>
  );
}
