import { useCallback, useEffect, useRef } from 'react';
import { getFocusableElements } from '../utils/accessibility.js';

export default function useKeyboardNav(containerRef, options = {}) {
  const { orientation = 'vertical', loop = true, onSelect } = options;
  const indexRef = useRef(-1);

  const focusItem = useCallback((idx) => {
    const container = containerRef?.current;
    if (!container) return;
    const items = getFocusableElements(container);
    if (items.length === 0) return;
    const safeIdx = loop
      ? ((idx % items.length) + items.length) % items.length
      : Math.max(0, Math.min(idx, items.length - 1));
    indexRef.current = safeIdx;
    items[safeIdx].focus();
  }, [containerRef, loop]);

  const handleKeyDown = useCallback((e) => {
    const container = containerRef?.current;
    if (!container) return;

    const items = getFocusableElements(container);
    if (items.length === 0) return;

    const currentIndex = items.indexOf(document.activeElement);
    if (currentIndex === -1) return;

    const prevKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';

    switch (e.key) {
      case prevKey:
        e.preventDefault();
        focusItem(currentIndex - 1);
        break;
      case nextKey:
        e.preventDefault();
        focusItem(currentIndex + 1);
        break;
      case 'Home':
        e.preventDefault();
        focusItem(0);
        break;
      case 'End':
        e.preventDefault();
        focusItem(items.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (onSelect) onSelect(items[currentIndex], currentIndex);
        break;
      case 'Escape':
        e.preventDefault();
        container.blur();
        break;
      default:
        break;
    }
  }, [containerRef, orientation, focusItem, onSelect]);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;
    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, handleKeyDown]);

  return { focusItem };
}
