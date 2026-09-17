/** Condition helpers */
export function matchRequire(
  require: Record<string, string | number | boolean> | undefined,
  flags: Record<string, string | number | boolean>,
  stats: Record<string, number>,
) {
  if (!require) return true
  return Object.entries(require).every(([k, v]) => flags[k] === v || stats[k] === v)
}

