'use client';

import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils/cn';

export interface HeroVideoProps {
  /** URL of the cut played from `lg` up. */
  desktop: string;
  /** URL of the cut played below `lg`. */
  mobile: string;
  /** Whether this clip's slide is the one on screen. */
  isActive: boolean;
  /** Whether this clip's slide is next in the cycle — the cue to buffer it. */
  isUpcoming: boolean;
  /** Classes for the `<video>`: the slide's `objectClassName`, if it sets one. */
  className?: string;
}

/**
 * A hero slide's clip, drawn over its photograph: played once from the top
 * each time the slide comes round, then held on its last frame.
 *
 * **One shot, not a loop.** Each clip is a single move, 6s long — the
 * carousel's dwell, `intervalMs` — and it ends on a frame unlike the one it
 * opened on. A loop would cut from that ending back to the opening in plain
 * view whenever the slide is held on screen, which keyboard focus does. So the
 * clip restarts only when its slide does, and is held, paused, through the
 * cross-fade out.
 *
 * **Not `<VideoFrame>`.** That primitive is an ambient loop with a single
 * poster that plays whenever it is on screen. This one is art-directed, runs
 * to the carousel's clock rather than to visibility alone, and sits inside the
 * backdrop's parallax wrapper over the slide's own pair of photographs.
 *
 * The photograph under it is the clip's first frame, which is what keeps the
 * rest simple:
 *
 *  - **Reduced motion gets the photograph.** The `<video>` is never in the
 *    server HTML and never mounts for anyone who prefers reduced motion, so
 *    for them the slide is the still the clip opens on. `useReducedMotion` is
 *    `true` on the server, so that is also what paints before hydration.
 *    /CLAUDE.md §5.
 *  - **The clip is invisible until it is playing.** It stays at zero opacity
 *    until the browser reports `playing`, then fades in over
 *    `--duration-media-fade`, as `<VideoFrame>` does. A clip that is still
 *    buffering, or that the browser will not autoplay (iOS in Low Power Mode),
 *    leaves the photograph showing, and the fade covers any difference between
 *    how a browser draws the video and the still.
 *  - **One element, one file.** The cut is chosen at the same `lg` divide the
 *    photographs switch on in CSS, so a phone never fetches the desktop cut.
 *    The photographs need both in the HTML to be art-directed without
 *    JavaScript; a video that mounts only on the client does not. Both hooks
 *    read the client's answer in the pass that first mounts the element, so
 *    its first `src` is already the right cut.
 *
 * It buffers when the slide before it comes on screen (`isUpcoming`), not at
 * page load: `preload="none"` until then keeps both clips off the first paint,
 * and a slide's dwell is the lead time.
 *
 * **Out of view it stops**, and starts again from the top when the hero comes
 * back — which is also when the carousel re-arms a full dwell for the slide
 * (`useHeroCarousel`). Without that, a clip left running under a hero that has
 * scrolled away is over by the time anyone returns, and its slide then sits
 * for a fresh dwell on the last frame.
 */
export function HeroVideo({ desktop, mobile, isActive, isUpcoming, className }: HeroVideoProps) {
  const reducedMotion = useReducedMotion();
  // `lg`, --breakpoint-lg: the divide the photographs' `lg:hidden` and
  // `hidden lg:block` switch on.
  const isDesktop = useMediaQuery('(min-width: 64rem)');
  const src = isDesktop ? desktop : mobile;

  const videoRef = useRef<HTMLVideoElement>(null);
  /** Whether the clip has shown a playing frame since it last loaded. */
  const [started, setStarted] = useState(false);
  /** Whether any of the clip's frame is inside the viewport. */
  const [inView, setInView] = useState(true);

  // `threshold: 0` is `useHeroCarousel`'s own test for the same question, so
  // the two agree on when the hero left and when it came back. `reducedMotion`
  // is a dependency because it decides whether there is an element to observe:
  // the clip mounts after hydration, and this has to run again once it has.
  useEffect(() => {
    const video = videoRef.current;
    if (reducedMotion || video === null || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry?.isIntersecting ?? true);
      },
      { threshold: 0 },
    );

    observer.observe(video);
    return () => {
      observer.disconnect();
    };
  }, [reducedMotion]);

  // `src` is a dependency because a new one reloads the element, which leaves
  // it paused.
  useEffect(() => {
    const video = videoRef.current;
    if (reducedMotion || video === null) return;

    if (!isActive || !inView) {
      video.pause();
      return;
    }

    video.currentTime = 0;
    video.play().catch((error: unknown) => {
      // Refused, as opposed to interrupted by a pause or a new `src`: hide
      // the clip so the photograph — its first frame — stands in for it.
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setStarted(false);
      }
    });
  }, [isActive, inView, src, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      playsInline
      disablePictureInPicture
      disableRemotePlayback
      preload={isActive || isUpcoming ? 'auto' : 'none'}
      // Decorative: the photograph under it carries the description, and the
      // headline carries the meaning.
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => {
        setStarted(true);
      }}
      // A new `src`, when the viewport crosses `lg`, empties the element and
      // loads the other cut from nothing. Hidden again until that one plays.
      onEmptied={() => {
        setStarted(false);
      }}
      className={cn(
        'absolute inset-0 size-full object-cover',
        'transition-opacity duration-(--duration-media-fade) ease-out',
        started ? 'opacity-100' : 'opacity-0',
        className,
      )}
    />
  );
}
