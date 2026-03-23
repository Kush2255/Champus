import { ReactNode } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

type AnimationType = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'blur';

interface AnimatedSectionProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'aside';
}

/**
 * ANIMATED SECTION COMPONENT
 * ==========================
 * Wrapper component that applies scroll-triggered animations to its children.
 * Uses Intersection Observer for performant animation triggering.
 */
export const AnimatedSection = ({
  children,
  animation = 'fade-up',
  delay = 0,
  className,
  as: Component = 'div',
}: AnimatedSectionProps) => {
  const [ref, isVisible] = useScrollAnimation<HTMLDivElement>();

  const animationClasses: Record<AnimationType, { initial: string; visible: string }> = {
    'fade-up': {
      initial: 'opacity-0 translate-y-8',
      visible: 'opacity-100 translate-y-0',
    },
    'fade-down': {
      initial: 'opacity-0 -translate-y-8',
      visible: 'opacity-100 translate-y-0',
    },
    'fade-left': {
      initial: 'opacity-0 translate-x-8',
      visible: 'opacity-100 translate-x-0',
    },
    'fade-right': {
      initial: 'opacity-0 -translate-x-8',
      visible: 'opacity-100 translate-x-0',
    },
    'scale': {
      initial: 'opacity-0 scale-95',
      visible: 'opacity-100 scale-100',
    },
    'blur': {
      initial: 'opacity-0 blur-sm',
      visible: 'opacity-100 blur-0',
    },
  };

  const { initial, visible } = animationClasses[animation];

  return (
    <Component
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        isVisible ? visible : initial,
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Component>
  );
};
