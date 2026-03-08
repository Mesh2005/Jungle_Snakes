/**
 * DEPRECATED: click sounds are now handled by AudioContext.tsx
 * This file is kept for compatibility but does nothing.
 */
export function playClickSound(): void {
  // no-op: click sounds go through AudioContext > playVFX('click')
}
