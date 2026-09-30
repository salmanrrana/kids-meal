import { useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';
import './Sheet.css';

/**
 * Bottom sheet on phones, centered modal from 600px up. Render it only while
 * open; unmounting closes it.
 *
 *   {open && (
 *     <Sheet title="Add dinner" subline="Wednesday, Sep 30" tools={<Tabs … />} onClose={() => setOpen(false)}>
 *       <ul>…rows…</ul>
 *     </Sheet>
 *   )}
 *
 * Layout: header (title, subline, ×) → optional `tools` row (tabs, search) →
 * scrolling body (`children`). `tall` fixes the height at the maximum so the
 * sheet doesn't jump while its list changes (e.g. searching).
 *
 * While open: Escape, the backdrop, and × call `onClose`; the page behind can't
 * scroll or take focus. Focus moves into the sheet (to a child with
 * `autoFocus`, else the panel) and goes back to whatever opened it on close.
 *
 * @param {{
 *   title: string,
 *   subline?: string,
 *   tools?: import('react').ReactNode,
 *   children: import('react').ReactNode,
 *   onClose: () => void,
 *   tall?: boolean,
 * }} props
 */
export function Sheet({
  title,
  subline,
  tools,
  children,
  onClose,
  tall = false,
}) {
  const titleId = useId();
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  // Captured on the first render, before focus moves into the sheet.
  const [opener] = useState(() => document.activeElement);
  // A click only closes when it both started and ended on the backdrop, so
  // dragging out of the search field doesn't dismiss the sheet.
  const pressedBackdrop = useRef(false);

  // Layout effect so closing lifts `inert` in the same commit that unmounts the
  // sheet; a toast shown on close is then announced, not swallowed.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const backdrop = panel?.parentElement;
    // Stop the page scrolling, and pad for the scrollbar that disappears so
    // nothing behind the backdrop shifts sideways.
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbar}px`;
    // The sheet is portalled into <body>; make everything else there inert.
    const others = [...document.body.children].filter(
      (el) => el !== backdrop && !el.hasAttribute('inert'),
    );
    others.forEach((el) => el.setAttribute('inert', ''));
    if (panel && !panel.contains(document.activeElement)) panel.focus();

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      others.forEach((el) => el.removeAttribute('inert'));
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [opener]);

  return createPortal(
    <div
      className="sheet-backdrop"
      onPointerDown={(e) => {
        pressedBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        // Portalled events still bubble through the React tree; keep them here.
        e.stopPropagation();
        if (pressedBackdrop.current && e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div
        ref={panelRef}
        className={`sheet ${tall ? 'sheet--tall' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="sheet-header">
          <div>
            <h2 id={titleId} className="sheet-title">
              {title}
            </h2>
            {subline && <p className="sheet-subline">{subline}</p>}
          </div>
          <button
            type="button"
            className="icon-btn"
            aria-label="Close"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </header>
        {tools && <div className="sheet-tools">{tools}</div>}
        <div className="sheet-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
