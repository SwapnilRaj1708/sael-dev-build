'use client';

import { Share2, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { SOCIAL_ICONS } from '@/components/icons/social';
import { SOCIAL_MARK_ON_FILL_CLASS, SocialBrandFill } from '@/components/ui/social-brand-fill';
import type { SocialLink } from '@/lib/content/static/footer';
import { cn } from '@/lib/utils/cn';

export interface SocialFabProps {
  links: readonly SocialLink[];
  /** Appended to each link's name for screen readers — "opens in a new tab". */
  newTabNote: string;
}

/**
 * The social FAB — a button fixed to the bottom-right of every page that
 * opens the social profiles. Added 2026-10-13 at the client's request; mounted
 * once, in the root layout.
 *
 * **Closed**, it is one gradient disc carrying a share mark, in the primary
 * CTA's gradient so it reads as the site's own control rather than a widget.
 * A halo pulses out of it three times a beat after the page loads and then
 * stops (`anim-fab-halo`), so it is noticed once and not nagged about.
 *
 * **Open**, the share mark turns into a close mark, and the profiles rise out
 * of the button as a column of white discs, each with its platform's name
 * beside it — the nearest first, one `--duration-fab-step` apart, and back in
 * the reverse order on closing. A disc fills with its platform's own colour
 * from the centre out under the pointer or keyboard focus, and lifts, exactly
 * as the footer's do (`<SocialBrandFill>`).
 *
 * Closes on the button, on Escape (focus returns to the button), on a press
 * anywhere outside it, and once a profile is opened — it opens in a new tab,
 * and the FAB should not be left open over the page when the reader returns.
 *
 * While closed, the column is `inert`: invisible links must not be reachable
 * by Tab or by a pointer. Under a reduced-motion preference nothing travels;
 * the column simply appears.
 *
 * It stacks under the masthead (`--z-fab`), so the mega menu and the mobile
 * drawer, which open from it, cover it. Renders nothing without profiles.
 */
export function SocialFab({ links, newTabNote }: SocialFabProps) {
  const [open, setOpen] = useState(false);
  // Once opened, the halo has done its job and does not come back on closing.
  const [found, setFound] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node | null)) setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  if (links.length === 0) return null;

  return (
    <div
      ref={rootRef}
      className="fixed right-fab-offset bottom-fab-offset z-(--z-fab) print:hidden"
    >
      <ul
        id={listId}
        aria-label="SAEL on social media"
        inert={!open}
        style={{ '--fab-n': links.length } as CSSProperties}
        className={cn(
          'absolute right-0 bottom-full mb-stack flex w-fab flex-col-reverse items-center gap-tight',
          !open && 'pointer-events-none',
        )}
      >
        {links.map((social, index) => {
          const Icon = SOCIAL_ICONS[social.platform];
          return (
            <li
              key={social.platform}
              style={{ '--fab-i': index } as CSSProperties}
              className={cn(
                'transition-[opacity,translate,scale] duration-(--duration-fab) ease-entrance',
                'motion-reduce:transition-none',
                open
                  ? 'translate-y-0 scale-100 opacity-100 [transition-delay:calc(var(--fab-i)*var(--duration-fab-step))]'
                  : 'translate-y-3 scale-75 opacity-0 [transition-delay:calc((var(--fab-n)-1-var(--fab-i))*var(--duration-fab-step))] motion-reduce:translate-y-0 motion-reduce:scale-100',
              )}
            >
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setOpen(false);
                }}
                className={cn(
                  'group/social relative flex size-fab-item items-center justify-center rounded-pill',
                  'bg-white text-footer-icon shadow-fab-item',
                  'transition duration-(--duration-micro)',
                  'hover:-translate-y-(--lift-social) focus-visible:-translate-y-(--lift-social)',
                  'motion-reduce:transform-none',
                )}
              >
                <SocialBrandFill platform={social.platform} />
                <Icon className={cn('size-5', SOCIAL_MARK_ON_FILL_CLASS)} />
                <span className="absolute right-full mr-tight rounded-pill border border-hairline-dark bg-surface-black px-3 py-1 text-body-sm whitespace-nowrap text-white shadow-fab-item">
                  {social.label}
                  <span className="sr-only"> — {newTabNote}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      <button
        ref={buttonRef}
        type="button"
        aria-label="SAEL on social media"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          setOpen((current) => !current);
          setFound(true);
        }}
        className={cn(
          'relative isolate flex size-fab cursor-pointer items-center justify-center rounded-pill',
          'bg-(image:--gradient-cta) text-white shadow-fab',
          'transition duration-(--duration-micro) hover:brightness-(--brightness-cta-hover)',
          'focus-visible:outline-offset-4 active:scale-95 motion-reduce:active:scale-100',
        )}
      >
        {/* Gone for good once the FAB has been opened: by then it has been found. */}
        {!found && (
          <span
            aria-hidden="true"
            className="anim-fab-halo pointer-events-none absolute inset-0 -z-10 rounded-pill bg-(image:--gradient-cta)"
          />
        )}
        <Share2
          aria-hidden="true"
          focusable="false"
          className={cn(
            'absolute size-6 transition duration-(--duration-fab) ease-entrance motion-reduce:transition-none',
            open ? 'scale-50 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100',
          )}
        />
        <X
          aria-hidden="true"
          focusable="false"
          className={cn(
            'absolute size-6 transition duration-(--duration-fab) ease-entrance motion-reduce:transition-none',
            open ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-90 opacity-0',
          )}
        />
      </button>
    </div>
  );
}
