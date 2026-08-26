"use client";

import { useEffect, useState, useRef } from "react";

interface UseCanvasFramesProps {
  totalFrames: number;
  framePrefix?: string;
  frameExtension?: string;
}

export function useCanvasFrames({
  totalFrames = 120,
  framePrefix = "/frames/",
  frameExtension = ".webp",
}: UseCanvasFramesProps) {
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [isFirstFrameLoaded, setIsFirstFrameLoaded] = useState<boolean>(false);
  const [isAllLoaded, setIsAllLoaded] = useState<boolean>(false);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    let isCancelled = false;
    imagesRef.current = new Array(totalFrames).fill(null);

    // Format index to 3-digit string (e.g. 001, 002... 120)
    const getFrameUrl = (index: number) => {
      const formatted = String(index + 1).padStart(3, "0");
      return `${framePrefix}${formatted}${frameExtension}`;
    };

    // 1. Priority load: First frame (001.webp) for immediate paint
    const firstImg = new Image();
    firstImg.src = getFrameUrl(0);
    firstImg.onload = () => {
      if (isCancelled) return;
      imagesRef.current[0] = firstImg;
      setIsFirstFrameLoaded(true);
      setLoadedCount(1);

      // 2. Progressive background load of remaining frames
      let currentLoaded = 1;
      for (let i = 1; i < totalFrames; i++) {
        const img = new Image();
        img.src = getFrameUrl(i);
        img.onload = () => {
          if (isCancelled) return;
          imagesRef.current[i] = img;
          currentLoaded++;
          setLoadedCount(currentLoaded);
          if (currentLoaded >= totalFrames) {
            setIsAllLoaded(true);
          }
        };
        img.onerror = () => {
          if (isCancelled) return;
          currentLoaded++;
          setLoadedCount(currentLoaded);
          if (currentLoaded >= totalFrames) {
            setIsAllLoaded(true);
          }
        };
      }
    };

    firstImg.onerror = () => {
      if (isCancelled) return;
      setIsFirstFrameLoaded(true);
    };

    return () => {
      isCancelled = true;
    };
  }, [totalFrames, framePrefix, frameExtension]);

  const getFrame = (index: number): HTMLImageElement | null => {
    const clampedIndex = Math.max(0, Math.min(totalFrames - 1, Math.round(index)));
    // If specific frame isn't loaded yet, find closest loaded frame
    if (imagesRef.current[clampedIndex]) {
      return imagesRef.current[clampedIndex];
    }
    for (let offset = 1; offset < totalFrames; offset++) {
      if (clampedIndex - offset >= 0 && imagesRef.current[clampedIndex - offset]) {
        return imagesRef.current[clampedIndex - offset];
      }
      if (clampedIndex + offset < totalFrames && imagesRef.current[clampedIndex + offset]) {
        return imagesRef.current[clampedIndex + offset];
      }
    }
    return imagesRef.current[0] || null;
  };

  const progress = Math.min(100, Math.round((loadedCount / totalFrames) * 100));

  return {
    getFrame,
    loadedCount,
    totalFrames,
    progress,
    isFirstFrameLoaded,
    isAllLoaded,
  };
}
