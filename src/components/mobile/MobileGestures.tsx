import React from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface SwipeableProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeDown?: () => void;
  swipeThreshold?: number;
  className?: string;
}

export function SwipeableContainer({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeDown,
  swipeThreshold = 50,
  className,
}: SwipeableProps) {
  const controls = useAnimation();
  const [startX, setStartX] = React.useState(0);

  const handleDragStart = (_: any, info: PanInfo) => {
    setStartX(info.point.x);
  };

  const handleDragEnd = async (_: any, info: PanInfo) => {
    const swipeDistance = info.point.x - startX;
    const swipeVertical = info.point.y - info.offset.y;

    try {
      if (Math.abs(swipeDistance) > swipeThreshold) {
        // Trigger haptic feedback
        await Haptics.impact({ style: ImpactStyle.Medium });

        if (swipeDistance > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (swipeDistance < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      } else if (swipeVertical > swipeThreshold && onSwipeDown) {
        await Haptics.impact({ style: ImpactStyle.Light });
        onSwipeDown();
      }
    } catch (error) {
      console.error('Error with haptic feedback:', error);
    }

    // Reset position with spring animation
    controls.start({
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    });
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      animate={controls}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  className,
}: PullToRefreshProps) {
  const controls = useAnimation();
  const [refreshing, setRefreshing] = React.useState(false);
  const pullThreshold = 80;

  const handleDrag = async (_: any, info: PanInfo) => {
    const pull = Math.max(0, info.offset.y);
    const progress = Math.min(pull / pullThreshold, 1);

    controls.set({
      y: pull,
      opacity: progress,
    });

    if (pull >= pullThreshold && !refreshing) {
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch (error) {
        console.error('Error with haptic feedback:', error);
      }
    }
  };

  const handleDragEnd = async (_: any, info: PanInfo) => {
    const pull = Math.max(0, info.offset.y);

    if (pull >= pullThreshold && !refreshing) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }

    controls.start({
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    });
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.4}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
      >
        <div className="absolute top-0 left-0 right-0 flex justify-center">
          <motion.div
            className="h-10 flex items-center justify-center text-muted-foreground"
            style={{ opacity: 0 }}
            animate={controls}
          >
            {refreshing ? 'Refreshing...' : 'Pull to refresh'}
          </motion.div>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

interface DoubleTapProps {
  children: React.ReactNode;
  onDoubleTap: () => void;
  className?: string;
}

export function DoubleTapContainer({
  children,
  onDoubleTap,
  className,
}: DoubleTapProps) {
  const [lastTap, setLastTap] = React.useState(0);
  const doubleTapThreshold = 300; // milliseconds

  const handleTap = async () => {
    const now = Date.now();
    if (now - lastTap < doubleTapThreshold) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
        onDoubleTap();
      } catch (error) {
        console.error('Error with haptic feedback:', error);
        onDoubleTap();
      }
    }
    setLastTap(now);
  };

  return (
    <motion.div onTap={handleTap} className={className}>
      {children}
    </motion.div>
  );
}
