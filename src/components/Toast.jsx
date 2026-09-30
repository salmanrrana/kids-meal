import { useCallback, useEffect, useRef, useState } from 'react';
import './Toast.css';

const TOAST_MS = 2200;

/**
 * State for one page's toast. `show(text)` displays it for 2.2s; showing again
 * restarts the timer. Pair it with <Toast>.
 *
 *   const { toast, show } = useToast();
 *   show('Copied to clipboard');
 *   <Toast toast={toast} />
 */
export function useToast() {
  const [toast, setToast] = useState(
    /** @type {{ id: number, text: string } | null} */ (null),
  );
  const timer = useRef(
    /** @type {ReturnType<typeof setTimeout> | undefined} */ (undefined),
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  const show = useCallback((/** @type {string} */ text) => {
    clearTimeout(timer.current);
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, text }));
    timer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  return { toast, show };
}

/**
 * Small ink message at the bottom center, above the bottom nav. Always render
 * it (even with no toast) so screen readers are already watching the region
 * when a message arrives.
 *
 * @param {{ toast: { id: number, text: string } | null }} props
 */
export function Toast({ toast }) {
  return (
    <div className="toast-region" role="status">
      {toast && (
        <p key={toast.id} className="toast">
          {toast.text}
        </p>
      )}
    </div>
  );
}
