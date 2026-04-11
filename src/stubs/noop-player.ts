/**
 * No-op React component used as a Vite alias replacement for react-player
 * backends that are never needed (this app only uses YouTube).
 *
 * Several player SDKs crash at module-evaluation time inside Cloudflare
 * Workers because they unconditionally access browser globals:
 *
 *   - @vimeo/player → throws "Vimeo Player API is not available"
 *   - imsc (via dashjs) → accesses window.getComputedStyle at top level
 *
 * Vite inlines all of react-player's React.lazy dynamic imports into a
 * single SSR chunk that is evaluated at Worker startup, so those
 * module-level checks run even though the components are never rendered.
 *
 * This stub replaces the real player modules, preventing their transitive
 * dependencies from being bundled at all.
 */
export default function NoopPlayer() {
  return null;
}
