/**
 * An `.mp4` import is the file's URL — `/_next/static/media/<name>.<hash>.mp4` —
 * via the `turbopack.rules` entry in next.config.ts, which gives the extension
 * Turbopack's `asset` type. docs/asset-inventory.md §3.
 *
 * ```tsx
 * import clip from '@/assets/images/hero/hero-slide-3-glasses-girl-desktop.mp4';
 * <video src={clip} muted playsInline />
 * ```
 */
declare module '*.mp4' {
  const src: string;
  export default src;
}
